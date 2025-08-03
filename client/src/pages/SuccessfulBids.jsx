import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Avatar,
  Chip,
  CircularProgress,
  Box,
  Button,
  Divider
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import bidsService from '../api/bids';
import { toast } from 'react-toastify';

const SuccessfulBidsPage = () => {
  const { user } = useAuth();
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalWinnings, setTotalWinnings] = useState(0);

  useEffect(() => {
    const fetchSuccessfulBids = async () => {
      try {
        const data = await bidsService.getSuccessfulBids(user.token);
        setBids(data);

        // Calculate total winnings
        const total = data.reduce((sum, bid) => sum + bid.amount, 0);
        setTotalWinnings(total);
      } catch (error) {
        console.error('Error fetching successful bids:', error);
        toast.error('Failed to load your winning bids');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchSuccessfulBids();
    }
  }, [user]);

  // Helper function to get the correct image URL
 const getItemImageUrl = (bid) => {
  // Try all possible paths to the image
  const possiblePaths = [
    bid?.Item?.imageUrl?.url,
    bid?.item?.imageUrl?.url,
    bid?.imageUrl,
    bid?.Item?.image?.url,  // common alternative
    bid?.item?.image?.url   // common alternative
  ];
  
  // Find the first truthy value
  const imageUrl = possiblePaths.find(url => !!url);
  
  // Return the found URL or default image
  return imageUrl || '/default-auction-image.jpg';
};

  // Helper function to get item name
  const getItemName = (bid) => {
    return bid?.Item?.name || bid?.item?.name || bid?.name || 'Unnamed Item';
  };

  // Helper function to get item description
  const getItemDescription = (bid) => {
    return bid?.Item?.description || bid?.item?.description || bid?.description || 'No description available';
  };

  if (loading) {
    return (
      <Box sx={{
        minHeight: '100vh',
        backgroundColor: '#000',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <CircularProgress sx={{ color: 'gold' }} />
      </Box>
    );
  }

  return (
    <Box sx={{
      minHeight: '100vh',
      backgroundColor: '#000',
      color: '#fff'
    }}>
      <Container
        maxWidth="lg"
        sx={{
          py: 4,
          pt: 10,
        }}
      >
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom sx={{ color: 'gold', fontWeight: 'bold' }}>
            🏆 Your Winning Bids
          </Typography>

          {bids.length > 0 && (
            <Box sx={{
              display: 'flex',
              gap: 2,
              mb: 3,
              flexWrap: 'wrap',
              alignItems: 'center'
            }}>
              <Chip
                label={`${bids.length} Items Won`}
                color="success"
                sx={{
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  backgroundColor: '#4caf50',
                  color: '#fff'
                }}
              />
              <Chip
                label={`Total Spent: ₹${totalWinnings.toLocaleString()}`}
                sx={{
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  backgroundColor: 'gold',
                  color: '#000'
                }}
              />
            </Box>
          )}

          <Divider sx={{ borderColor: '#333', mb: 3 }} />
        </Box>

        {bids.length === 0 ? (
          <Box sx={{
            textAlign: 'center',
            py: 8,
            backgroundColor: '#111',
            borderRadius: 2,
            border: '1px solid #333'
          }}>
            <Typography variant="h6" sx={{ mb: 2, color: '#aaa' }}>
              No winning bids yet
            </Typography>
            <Typography variant="body1" sx={{ color: '#666' }}>
              Start bidding on items to see your wins here!
            </Typography>
            <Button
              variant="outlined"
              sx={{
                mt: 2,
                color: 'gold',
                borderColor: 'gold',
                '&:hover': {
                  backgroundColor: 'gold',
                  color: '#000'
                }
              }}
              onClick={() => window.location.href = '/'}
            >
              Browse Items
            </Button>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {bids.map((bid, index) => (
              <Grid item xs={12} sm={6} md={4} key={bid.id || index}>
                <Card sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  backgroundColor: 'transparent',
                  backgroundImage: 'none',
                  color: '#fff',
                  border: '1px solid #333',
                  borderRadius: 2,
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 25px rgba(255, 215, 0, 0.3)'
                  }
                }}>
                  {/* Fixed height image container */}
                  <Box sx={{
                    position: 'relative',
                    height: 200,
                    overflow: 'hidden'
                  }}>
                    <CardMedia
                      component="img"
                      height="200"
                      image={getItemImageUrl(bid)}
                      alt={getItemName(bid)}
                      sx={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        backgroundColor: '#1a1a1a'
                      }}
                      onError={(e) => {
                        e.target.src = '/default-auction-image.jpg';
                      }}
                    />
                    <Chip
                      label={`Win #${index + 1}`}
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        backgroundColor: 'gold',
                        color: '#000',
                        fontWeight: 'bold'
                      }}
                    />
                  </Box>

                  {/* Card content with fixed height */}
                  <CardContent sx={{
                    flexGrow: 1,
                    p: 3,
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    backdropFilter: 'blur(4px)',
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%',
                    minHeight: 300 // Set a minimum height for the content area
                  }}>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography gutterBottom variant="h6" component="h2" sx={{
                        fontWeight: 'bold',
                        color: '#fff',
                        mb: 1,
                        minHeight: '3em', // Fixed height for title
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}>
                        {getItemName(bid)}
                      </Typography>

                      <Typography variant="body2" sx={{
                        color: '#aaa',
                        mb: 3,
                        minHeight: '4.5em', // Fixed height for description
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}>
                        {getItemDescription(bid)}
                      </Typography>

                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                        <Avatar sx={{
                          mr: 2,
                          backgroundColor: 'gold',
                          color: '#000',
                          fontWeight: 'bold'
                        }}>
                          {bid.User?.username?.charAt(0).toUpperCase() || 'U'}
                        </Avatar>
                        <Box>
                          <Typography variant="body1" sx={{ color: '#4caf50', fontWeight: 'bold' }}>
                            🎉 You won this auction!
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#aaa' }}>
                            Congratulations {bid.User?.username || 'User'}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>

                    <Box>
                      <Box sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mb: 2
                      }}>
                        <Chip
                          label={`Winning Bid: ₹${bid.amount.toLocaleString()}`}
                          sx={{
                            backgroundColor: 'gold',
                            color: '#000',
                            fontWeight: 'bold',
                            fontSize: '0.9rem'
                          }}
                        />
                      </Box>

                      <Typography variant="body2" sx={{
                        color: '#666',
                        textAlign: 'center',
                        mt: 2,
                        p: 1,
                        backgroundColor: 'rgba(10, 10, 10, 0.5)',
                        borderRadius: 1,
                        border: '1px solid #333'
                      }}>
                        Won on {new Date(bid.createdAt).toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {bids.length > 0 && (
          <Box sx={{
            mt: 4,
            p: 3,
            backgroundColor: 'rgba(17, 17, 17, 0.8)',
            borderRadius: 2,
            border: '1px solid #333',
            textAlign: 'center',
            backdropFilter: 'blur(4px)'
          }}>
            <Typography variant="h6" sx={{ color: 'gold', mb: 1 }}>
              🏆 Auction Summary
            </Typography>
            <Typography variant="body1" sx={{ color: '#aaa' }}>
              You've successfully won {bids.length} auction(s) with a total investment of ₹{totalWinnings.toLocaleString()}
            </Typography>
            <Typography variant="body2" sx={{ color: '#666', mt: 1 }}>
              Keep bidding to expand your collection!
            </Typography>
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default SuccessfulBidsPage;