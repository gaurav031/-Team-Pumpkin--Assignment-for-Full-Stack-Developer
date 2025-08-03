import { Container, Grid, Typography, Button, Box, Fab } from '@mui/material';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import itemsService from '../api/items';
import ItemCard from '../components/ItemCard';
import { Link, useNavigate } from 'react-router-dom';
import GavelIcon from '@mui/icons-material/Gavel';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import GroupIcon from '@mui/icons-material/Group';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AddIcon from '@mui/icons-material/Add';
import { WebSocketProvider, useWebSocket } from '../context/WebSocketContext';

const HomePageContent = () => {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [globalMessages, setGlobalMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const socket = useWebSocket(); // Get the socket from context

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const data = await itemsService.getItems();
        const activeItems = data.filter(item =>
          !item.lockedUntil || new Date() <= new Date(item.lockedUntil)
        );
        setItems(activeItems);
      } catch (error) {
        console.error('Error fetching items:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, []);

  // Update WebSocket handling
  useEffect(() => {
    if (!socket) return;

    const handleGlobalMessage = (data) => {
      if (data.action === 'BID_STARTED' || data.action === 'BID_WON') {
        setGlobalMessages(prev => [...prev, data.message].slice(-5)); // Keep last 5 messages
      }
    };

    socket.subscribe('global', handleGlobalMessage);

    return () => {
      socket.unsubscribe('global', handleGlobalMessage);
    };
  }, [socket]); // Use socket as dependency

  const handleBidSuccess = (result) => {
    setItems(prevItems =>
      prevItems.map(item =>
        item.id === result.itemId
          ? {
            ...item,
            currentPrice: result.newPrice,
            winningBidder: result.bidder,
            lockedUntil: result.lockedUntil,
            winningBidderId: result.bidderId
          }
          : item
      )
    );
  };

  const handleBidWin = (itemId) => {
    setItems(prevItems => prevItems.filter(item => item.id !== itemId));
  };

  const MessageTicker = () => (
    <Box sx={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: 'rgba(0,0,0,0.7)',
      color: 'white',
      padding: 1,
      zIndex: 1000,
      overflow: 'hidden'
    }}>
      <Typography variant="body2" sx={{
        whiteSpace: 'nowrap',
        animation: 'scroll 20s linear infinite',
        '@keyframes scroll': {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(-100%)' }
        }
      }}>
        {globalMessages.join(' • ')}
      </Typography>
    </Box>
  );

  return (
    <Box sx={{ backgroundColor: '#0c0b0b', color: 'white', minHeight: '100vh' }}>
      {user && (
        <Fab
          color="primary"
          aria-label="add"
          sx={{
            position: 'fixed',
            bottom: 32,
            right: 32,
            backgroundColor: 'gold',
            '&:hover': {
              backgroundColor: '#ffca28',
            }
          }}
          onClick={() => navigate('/create-item')}
        >
          <AddIcon />
        </Fab>
      )}
      {!user && (
        <>
          <Container sx={{ py: 8, textAlign: 'center' }}>
            <GavelIcon sx={{ fontSize: 50, color: 'gold', mb: 1 }} />
            <Typography variant="h3" fontWeight="bold">
              One-Click <span style={{ color: 'gold' }}>Auctions</span>
            </Typography>
            <Typography variant="body1" sx={{ mt: 2, maxWidth: 600, mx: 'auto', color: '#9da9bb' }}>
              Experience the thrill of instant bidding. Each bid must beat the last by exactly ₹1, starting from ₹100. First bid wins during the 3-second processing window.
            </Typography>
            <Box sx={{ mt: 4 }}>
              <Button variant="contained" color="warning" sx={{ mr: 2 }} component={Link} to="/register">
                Start Bidding Today
              </Button>
              <Button variant="outlined" color="warning" component={Link} to="/login">
                Sign In
              </Button>
            </Box>

            <Grid container spacing={4} justifyContent="center" sx={{ mt: 6 }}>
              <Grid item>
                <Box textAlign="center">
                  <TrendingUpIcon sx={{ fontSize: 40, color: 'gold' }} />
                  <Typography variant="h6">{items.length}</Typography>
                  <Typography variant="body2" color="gray">Active Auctions</Typography>
                </Box>
              </Grid>
              <Grid item>
                <Box textAlign="center">
                  <GroupIcon sx={{ fontSize: 40, color: 'gold' }} />
                  <Typography variant="h6">0</Typography>
                  <Typography variant="body2" color="gray">Total Bids Placed</Typography>
                </Box>
              </Grid>
              <Grid item>
                <Box textAlign="center">
                  <AccessTimeIcon sx={{ fontSize: 40, color: 'gold' }} />
                  <Typography variant="h6">3s</Typography>
                  <Typography variant="body2" color="gray">Winning Timer</Typography>
                </Box>
              </Grid>
            </Grid>
          </Container>

          <Box sx={{ py: 6, backgroundColor: '#111' }}>
            <Container>
              <Typography variant="h4" textAlign="center" gutterBottom>
                How It Works
              </Typography>
              <Grid container spacing={4} justifyContent="center">
                {["Choose an Item", "One-Click Bid", "Win in 3 Seconds"].map((step, idx) => (
                  <Grid item xs={12} sm={4} key={idx}>
                    <Box textAlign="center">
                      <Box
                        sx={{
                          width: 60,
                          height: 60,
                          borderRadius: '50%',
                          backgroundColor: 'gold',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mb: 2,
                          fontWeight: 'bold',
                          fontSize: 20,
                          color: '#000'
                        }}
                      >
                        {idx + 1}
                      </Box>
                      <Typography variant="h6">{step}</Typography>
                      <Typography variant="body2" color="gray" sx={{ maxWidth: 300, mx: 'auto' }}>
                        {idx === 0
                          ? 'Browse through our exclusive collection of premium items up for auction.'
                          : idx === 1
                            ? 'Click once to bid exactly ₹1 more than the current highest bid.'
                            : 'First valid bid during the 3-second processing window wins the round.'}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Container>
          </Box>
        </>
      )}

      <Container sx={{ py: 16 }}>
        <Typography variant="h4" textAlign="center" gutterBottom>
          Live Auctions
        </Typography>
        <Typography variant="body2" textAlign="center" color="gray" mb={4}>
          Bid on these exclusive items now. Remember, each bid must be exactly ₹1 more than the previous bid!
        </Typography>
        <Grid container spacing={4}>
          {items.map((item) => (
            <Grid item key={item.id} xs={12} sm={6} md={4}>
              <ItemCard
                item={item}
                onBidSuccess={handleBidSuccess}
                onBidWin={handleBidWin}
              />
            </Grid>
          ))}
        </Grid>
      </Container>

      {globalMessages.length > 0 && <MessageTicker />}
    </Box>
  );
};

const HomePage = () => {
  return (
    <WebSocketProvider>
      <HomePageContent />
    </WebSocketProvider>
  );
};

export default HomePage;