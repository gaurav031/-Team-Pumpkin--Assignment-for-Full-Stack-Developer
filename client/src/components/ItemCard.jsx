import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Chip,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  CardMedia,
  Box,
  Stack,
  CircularProgress,
  Snackbar,
  Alert
} from '@mui/material';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useWebSocket } from '../context/WebSocketContext';
import bidsService from '../api/bids';
import { toast } from 'react-toastify';

const ItemCard = ({ item: initialItem, onBidSuccess, onBidWin }) => {
  const { user } = useAuth();
  const socket = useWebSocket();
  const [item, setItem] = useState(initialItem);
  const [isBidding, setIsBidding] = useState(false);
  const [openBidDialog, setOpenBidDialog] = useState(false);
  const [bidAmount, setBidAmount] = useState(0);
  const [bidTimeLeft, setBidTimeLeft] = useState(0);
  const [bidTimer, setBidTimer] = useState(null);
  const [showWinnerAlert, setShowWinnerAlert] = useState(false);
  const [winnerMessage, setWinnerMessage] = useState('');
  const [isItemSold, setIsItemSold] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [showCountdown, setShowCountdown] = useState(false);
  const [countdownTimer, setCountdownTimer] = useState(null);
  const [showYouWon, setShowYouWon] = useState(false);

  useEffect(() => {
    setItem(initialItem);
    // Set minimum bid amount (always at least 1 rupee more than current price)
    setBidAmount(initialItem.currentPrice + 1);
  }, [initialItem]);

  useEffect(() => {
    if (!socket) return;

    const handleBidUpdate = (data) => {
      try {
        if (data.itemId === item.id) {
          const updatedItem = {
            ...item,
            currentPrice: data.newPrice,
            lockedUntil: data.lockedUntil,
            winningBidderId: data.bidderId,
            winningBidder: data.bidder
          };
          
          setItem(updatedItem);
          setBidAmount(data.newPrice + 1); // Next bid must be at least 1 rupee more
          startBidCountdown(new Date(data.lockedUntil));

          // Start countdown timer on image
          startCountdownTimer();

          if (data.action === 'NEW_BID') {
            toast.info(`New bid: ₹${data.newPrice} by ${data.bidder}`);
          }

          if (user && data.bidderId === user.id) {
            toast.success('You are currently the highest bidder!');
          } else if (user) {
            toast.warning(`${data.bidder} outbid you! New highest bid: ₹${data.newPrice}`);
          }
        }
      } catch (error) {
        console.error('Error processing bid update:', error);
      }
    };

    const handleBidWin = (data) => {
      try {
        if (data.itemId === item.id) {
          setWinnerMessage(data.message);
          setShowWinnerAlert(true);
          setIsItemSold(true);
          setShowCountdown(false);
          setShowYouWon(false);
          
          setItem(prev => ({
            ...prev,
            winningBidder: data.bidder,
            winningBidderId: data.bidderId,
            finalPrice: data.amount,
            isSold: true
          }));
          
          if (onBidWin) onBidWin(item.id);
          
          // Clear any running timers
          if (bidTimer) {
            clearInterval(bidTimer);
            setBidTimer(null);
          }
          if (countdownTimer) {
            clearTimeout(countdownTimer);
            setCountdownTimer(null);
          }
          setBidTimeLeft(0);
        }
      } catch (error) {
        console.error('Error processing bid win:', error);
      }
    };

    socket.subscribe(`item:${item.id}`, handleBidUpdate);
    socket.subscribe(`item:${item.id}:win`, handleBidWin);

    return () => {
      socket.unsubscribe(`item:${item.id}`, handleBidUpdate);
      socket.unsubscribe(`item:${item.id}:win`, handleBidWin);
      if (bidTimer) clearInterval(bidTimer);
      if (countdownTimer) clearTimeout(countdownTimer);
    };
  }, [socket, item.id, user, onBidWin, bidTimer, countdownTimer]);

  const startBidCountdown = (endTime) => {
    if (bidTimer) clearInterval(bidTimer);

    const timer = setInterval(() => {
      const now = new Date();
      const diff = endTime - now;
      const seconds = Math.max(0, Math.floor(diff / 1000));

      setBidTimeLeft(seconds);

      if (seconds <= 0) {
        clearInterval(timer);
        setBidTimer(null);
      }
    }, 100); // Update more frequently for smooth countdown

    setBidTimer(timer);
  };

  const startCountdownTimer = () => {
    // Clear existing countdown timer
    if (countdownTimer) {
      clearTimeout(countdownTimer);
    }
    
    // Reset states
    setShowCountdown(true);
    setShowYouWon(false);
    
    // Start 3-second countdown
    const timer = setTimeout(() => {
      setShowCountdown(false);
      // Check if current user is still the winning bidder
      if (user && item.winningBidderId === user.id && !isItemSold) {
        setShowYouWon(true);
        // Auto-hide "You Won" message after 2 seconds
        setTimeout(() => {
          setShowYouWon(false);
        }, 2000);
      }
    }, 3000);
    
    setCountdownTimer(timer);
  };

  const CountdownOverlay = () => {
    const [countdown, setCountdown] = useState(3);
    
    useEffect(() => {
      if (!showCountdown) return;
      
      setCountdown(3);
      const interval = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => clearInterval(interval);
    }, [showCountdown]);
    
    if (!showCountdown || countdown <= 0) return null;
    
    return (
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          zIndex: 10
        }}
      >
        <Typography
          variant="h1"
          sx={{
            color: '#fff',
            fontWeight: 'bold',
            fontSize: '4rem',
            textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
            animation: 'pulse 1s ease-in-out'
          }}
        >
          {countdown}
        </Typography>
      </Box>
    );
  };

  const YouWonOverlay = () => {
    if (!showYouWon) return null;
    
    return (
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(76, 175, 80, 0.9)',
          zIndex: 10
        }}
      >
        <Typography
          variant="h4"
          sx={{
            color: '#fff',
            fontWeight: 'bold',
            textAlign: 'center',
            textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
            animation: 'celebrateWin 0.5s ease-in-out'
          }}
        >
          🎉 YOU WON! 🎉
        </Typography>
      </Box>
    );
  };

  const handleBidSubmit = async () => {
    setIsBidding(true);
    try {
      const result = await bidsService.placeBid(
        item.id, 
        Number(bidAmount),
        user.token
      );
      onBidSuccess(result);
      setOpenBidDialog(false);
      toast.success(`Bid placed successfully! You bid ₹${bidAmount}`);
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Bid failed');
    } finally {
      setIsBidding(false);
    }
  };

  const getButtonText = () => {
    if (!user) return 'Login to Bid';
    if (isItemSold) return 'Item Sold';
    if (isBidding) return 'Placing Bid...';
    if (isBiddingActive()) {
      if (item.winningBidderId === user.id) {
        return `You're Winning! (₹${item.currentPrice + 1} to rebid)`;
      }
      return `Outbid (₹${item.currentPrice + 1})`;
    }
    return `Start Bidding (₹${item.currentPrice + 1})`;
  };

  const isBiddingActive = () => {
    return !isItemSold && item.lockedUntil && new Date(item.lockedUntil) > new Date();
  };

  const getButtonColor = () => {
    if (isItemSold) return '#666';
    if (isBiddingActive() && item.winningBidderId === user?.id) return '#4caf50';
    if (isBiddingActive()) return '#ff9800';
    return '#fff';
  };

  // Don't render sold items
  if (isItemSold || (item.isSold)) {
    return null;
  }

  return (
    <>
      <Card sx={{
        width: 300, // Fixed width
        height: 580, // Fixed height
        m: 2,
        backgroundColor: '#111',
        color: '#fff',
        borderRadius: 2,
        overflow: 'hidden',
        boxShadow: '0 0 10px rgba(255, 255, 255, 0.05)',
        position: 'relative',
        transition: 'transform 0.2s',
        '&:hover': { transform: 'scale(1.02)' },
        border: isBiddingActive() ? '2px solid #1976d2' : '1px solid #333',
        display: 'flex',
        flexDirection: 'column' // Ensure consistent layout
      }}>
        {isBiddingActive() && (
          <Chip
            label={`${bidTimeLeft}s left`}
            size="small"
            color="primary"
            sx={{
              position: 'absolute',
              top: 10,
              right: 10,
              backgroundColor: bidTimeLeft <= 10 ? '#f44336' : '#1976d2',
              color: '#fff',
              fontWeight: 'bold',
              zIndex: 1,
              animation: bidTimeLeft <= 10 ? 'pulse 1s infinite' : 'none'
            }}
          />
        )}

        {item.winningBidderId === user?.id && isBiddingActive() && !showCountdown && !showYouWon && (
          <Chip
            label="You're Winning!"
            size="small"
            sx={{
              position: 'absolute',
              top: 10,
              left: 10,
              backgroundColor: '#4caf50',
              color: '#fff',
              fontWeight: 'bold',
              zIndex: 1
            }}
          />
        )}

        <Box 
          sx={{ 
            height: 200, // Fixed height for image container
            overflow: 'hidden',
            position: 'relative'
          }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <CardMedia
            component="img"
            height="200"
            image={item.imageUrl || '/default-auction-image.jpg'}
            alt={item.name}
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              borderBottom: '1px solid #333',
              backgroundColor: '#1a1a1a',
              transition: 'transform 0.3s ease',
              transform: isHovered ? 'scale(1.1)' : 'scale(1)'
            }}
          />
          <CountdownOverlay />
          <YouWonOverlay />
        </Box>

        <CardContent sx={{ flexGrow: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
            {item.name}
          </Typography>
          <Typography 
            variant="body2" 
            sx={{ 
              opacity: 0.8, 
              mb: 2, 
              minHeight: 60,
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}
          >
            {item.description}
          </Typography>

          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="body2" sx={{ color: '#aaa' }}>
                Current Bid
              </Typography>
              <Typography variant="h6" sx={{ color: 'gold', fontWeight: 600 }}>
                ₹{item.currentPrice}
              </Typography>
              {item.winningBidder && (
                <Typography variant="caption" sx={{ color: '#aaa' }}>
                  by {item.winningBidder}
                </Typography>
              )}
            </Box>
            <Box>
              <Typography variant="body2" sx={{ color: '#aaa' }}>
                Min Next Bid
              </Typography>
              <Typography variant="h6" sx={{ color: 'gold', fontWeight: 600 }}>
                ₹{item.currentPrice + 1}
              </Typography>
            </Box>
          </Stack>
        </CardContent>

        <CardActions sx={{ borderTop: '1px solid #333', p: 2 }}>
          <Button
            fullWidth
            onClick={() => setOpenBidDialog(true)}
            disabled={!user || isBidding || isItemSold}
            sx={{
              backgroundColor: 'transparent',
              color: getButtonColor(),
              border: `1px solid ${getButtonColor()}`,
              fontWeight: 'bold',
              '&:hover': {
                backgroundColor: getButtonColor(),
                color: '#000'
              },
              '&:disabled': {
                borderColor: '#666',
                color: '#666'
              }
            }}
          >
            {getButtonText()}
          </Button>
        </CardActions>
      </Card>

      <Dialog 
        open={openBidDialog} 
        onClose={() => setOpenBidDialog(false)}
        PaperProps={{
          sx: {
            backgroundColor: '#111',
            color: '#fff',
            border: '1px solid #333',
            borderRadius: 2,
            minWidth: '400px'
          }
        }}
      >
        <DialogTitle sx={{ borderBottom: '1px solid #333' }}>
          <Typography variant="h6" sx={{ color: 'gold' }}>
            Place Your Bid
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ py: 3 }}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body1" sx={{ color: '#aaa' }}>
              Current Highest Bid:
            </Typography>
            <Typography variant="h5" sx={{ color: 'gold' }}>
              ₹{item.currentPrice}
            </Typography>
            {item.winningBidder && (
              <Typography variant="body2" sx={{ color: '#aaa' }}>
                by {item.winningBidder}
              </Typography>
            )}
          </Box>
          
          <Box sx={{ mb: 2 }}>
            <Typography variant="body1" sx={{ color: '#aaa' }}>
              Minimum Bid Required:
            </Typography>
            <Typography variant="h5" sx={{ color: '#ff9800' }}>
              ₹{item.currentPrice + 1}
            </Typography>
          </Box>
          
          <TextField
            autoFocus
            margin="dense"
            label="Your Bid Amount"
            type="number"
            fullWidth
            variant="outlined"
            value={bidAmount}
            onChange={(e) => setBidAmount(Math.max(item.currentPrice + 1, Number(e.target.value)))}
            inputProps={{ 
              min: item.currentPrice + 1,
              step: 1
            }}
            sx={{
              mt: 2,
              '& .MuiOutlinedInput-root': {
                color: '#fff',
                '& fieldset': { borderColor: '#333' },
                '&:hover fieldset': { borderColor: '#555' },
                '&.Mui-focused fieldset': { borderColor: 'gold' },
              },
              '& .MuiInputLabel-root': { color: '#aaa' },
              '& .MuiInputLabel-root.Mui-focused': { color: 'gold' },
            }}
          />
          
          <Typography variant="caption" sx={{ color: '#aaa', mt: 1, display: 'block' }}>
            Bid must be at least ₹1 more than the current highest bid
          </Typography>
        </DialogContent>
        <DialogActions sx={{ borderTop: '1px solid #333', p: 2 }}>
          <Button 
            onClick={() => setOpenBidDialog(false)}
            sx={{
              color: '#fff',
              border: '1px solid #333',
              '&:hover': { backgroundColor: '#333' }
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleBidSubmit}
            disabled={bidAmount < (item.currentPrice + 1) || isBidding}
            startIcon={isBidding ? <CircularProgress size={20} /> : null}
            sx={{
              backgroundColor: 'gold',
              color: '#000',
              fontWeight: 'bold',
              '&:hover': { backgroundColor: '#ffd700' },
              '&:disabled': { backgroundColor: '#333', color: '#666' }
            }}
          >
            {isBidding ? 'Placing Bid...' : `Bid ₹${bidAmount}`}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={showWinnerAlert}
        autoHideDuration={6000}
        onClose={() => setShowWinnerAlert(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setShowWinnerAlert(false)} 
          severity={item.winningBidderId === user?.id ? "success" : "info"}
          sx={{ width: '100%' }}
        >
          {winnerMessage}
        </Alert>
      </Snackbar>

      <style jsx>{`
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
        }
        
        @keyframes celebrateWin {
          0% { transform: scale(0.8); opacity: 0; }
          50% { transform: scale(1.1); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </>
  );
};

export default ItemCard;