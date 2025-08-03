import { Item, Bid, User } from '../models/index.js';

const getItems = async (req, res) => {
  try {
    const items = await Item.findAll({
      include: [
        {
          model: Bid,
          include: [User],
          order: [['createdAt', 'DESC']],
          limit: 1,
        },
      ],
    });

    const formattedItems = items.map((item) => {
      const latestBid = item.Bids?.[0] || null;
      return {
        id: item.id,
        name: item.name,
        description: item.description,
        currentPrice: item.currentPrice,
        lockedUntil: item.lockedUntil,
        imageUrl: item.imageUrl ? `${req.protocol}://${req.get('host')}${item.imageUrl}` : null,
        winningBidder: latestBid?.User?.username || null,
        winningBidderId: latestBid?.UserId || null,
      };
    });

    res.json(formattedItems);
  } catch (error) {
    console.error('Error in getItems:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

const createItem = async (req, res) => {
  try {
    const { name, description, startingPrice } = req.body;
    const userId = req.user?.id;

    if (!name || !description || !startingPrice) {
      return res.status(400).json({ 
        message: 'Name, description, and starting price are required' 
      });
    }

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const price = Number(startingPrice);
    if (isNaN(price)) {
      return res.status(400).json({ 
        message: 'Starting price must be a valid number' 
      });
    }

    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    const item = await Item.create({
      name: name.trim(),
      description: description.trim(),
      currentPrice: price,
      imageUrl,
      UserId: userId,
    });

    const responseItem = {
      ...item.toJSON(),
      imageUrl: imageUrl ? `${req.protocol}://${req.get('host')}${imageUrl}` : null
    };

    res.status(201).json(responseItem);
  } catch (error) {
    console.error('Error in createItem:', error);
    
    if (error.name === 'SequelizeValidationError') {
      const validationErrors = error.errors.map(err => ({
        field: err.path,
        message: err.message
      }));
      return res.status(400).json({ 
        message: 'Validation error', 
        errors: validationErrors 
      });
    }
    
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

export { getItems, createItem };