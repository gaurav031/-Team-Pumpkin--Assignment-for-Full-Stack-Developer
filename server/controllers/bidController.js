import { Item, Bid, User } from '../models/index.js';
import { Sequelize } from 'sequelize';
import { sequelize } from '../config/database.js';
import { publishMessage } from '../services/websocketService.js';

const placeBid = async (req, res) => {
  const { itemId, amount } = req.body;
  const userId = req.user.id;

  try {
    const result = await sequelize.transaction(async (t) => {
      const item = await Item.findByPk(itemId, {
        transaction: t,
        lock: t.LOCK.UPDATE,
      });

      if (!item) {
        throw new Error('Item not found');
      }

      // Validate bid amount - must be at least 1 rupee more than current price
      const minBidAmount = item.currentPrice + 1;
      if (amount < minBidAmount) {
        throw new Error(`Bid must be at least ₹${minBidAmount}`);
      }

      // Check if bidding is still active (within lock window)
      const now = new Date();
      if (item.lockedUntil && now < new Date(item.lockedUntil)) {
        // Bidding is active, check if this bid is higher than current
        if (amount <= item.currentPrice) {
          throw new Error(`Bid must be higher than current price of ₹${item.currentPrice}`);
        }
      }

      // Extend the lock window by 3 seconds from now for new bids
      const lockedUntil = new Date(Date.now() + 3000); // 3 seconds

      // Update item with new bid
      await item.update(
        {
          currentPrice: amount,
          lockedUntil,
          version: item.version + 1,
          winningBidderId: userId,
        },
        { transaction: t }
      );

      // Create the bid record
      const bid = await Bid.create(
        {
          amount: amount,
          ItemId: itemId,
          UserId: userId,
          isWinning: false, // Initially not winning until window closes
        },
        { transaction: t }
      );

      const user = await User.findByPk(userId, {
        attributes: ['username'],
        transaction: t,
      });

      return {
        itemId: item.id,
        newPrice: amount,
        bidder: user.username,
        bidderId: userId,
        lockedUntil,
        action: 'NEW_BID',
        minNextBid: amount + 1,
      };
    });

    // Publish bid update via WebSocket
    publishMessage(`item:${itemId}`, JSON.stringify(result));
    publishMessage('global', JSON.stringify({
      action: 'BID_PLACED',
      message: `${result.bidder} bid ₹${result.newPrice} on item ${result.itemId}`,
      itemId: result.itemId,
      newPrice: result.newPrice,
      bidder: result.bidder
    }));

    // Clear any existing timeout for this item and set new one
    setTimeout(async () => {
      try {
        const item = await Item.findByPk(itemId);
        if (item && new Date() >= item.lockedUntil) {
          // Find the highest bid for this item
          const winningBid = await Bid.findOne({
            where: { ItemId: itemId },
            order: [['amount', 'DESC'], ['createdAt', 'ASC']], // Highest amount, earliest if tie
            include: [User]
          });

          if (winningBid) {
            // Mark this bid as winning
            await Bid.update(
              { isWinning: true },
              { where: { id: winningBid.id } }
            );

            // Mark all other bids for this item as not winning
            await Bid.update(
              { isWinning: false },
              {
                where: {
                  ItemId: itemId,
                  id: { [Sequelize.Op.ne]: winningBid.id },
                }
              }
            );

            // Update item to mark as sold
            await Item.update(
              { 
                isSold: true,
                finalPrice: winningBid.amount,
                soldAt: new Date()
              },
              { where: { id: itemId } }
            );

            const winMessage = {
              itemId,
              bidderId: winningBid.UserId,
              bidder: winningBid.User.username,
              amount: winningBid.amount,
              message: `🎉 ${winningBid.User.username} won the bid for ₹${winningBid.amount}!`,
              action: 'BID_WIN'
            };
            
            publishMessage(`item:${itemId}:win`, JSON.stringify(winMessage));
            publishMessage('global', JSON.stringify({
              action: 'BID_WON',
              message: `${winningBid.User.username} won item ${itemId} for ₹${winningBid.amount}`,
              itemId,
              winner: winningBid.User.username,
              amount: winningBid.amount
            }));
          }
        }
      } catch (error) {
        console.error('Error processing winning bid:', error);
      }
    }, 3000); // 3 seconds timeout

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
};

const getSuccessfulBids = async (req, res) => {
  try {
    const userId = req.user.id; // Get current user's ID
    
    const bids = await Bid.findAll({
      where: { 
        isWinning: true,
        UserId: userId // Only get bids won by current user
      },
      include: [
        {
          model: Item,
          attributes: ['id', 'name', 'imageUrl', 'description'],
        },
        {
          model: User,
          attributes: ['id', 'username'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    res.json(bids);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all winning bids (for admin or public view)
const getAllSuccessfulBids = async (req, res) => {
  try {
    const bids = await Bid.findAll({
      where: { isWinning: true },
      include: [
        {
          model: Item,
          attributes: ['id', 'name', 'imageUrl', 'description'],
        },
        {
          model: User,
          attributes: ['id', 'username'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    res.json(bids);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export { placeBid, getSuccessfulBids, getAllSuccessfulBids };