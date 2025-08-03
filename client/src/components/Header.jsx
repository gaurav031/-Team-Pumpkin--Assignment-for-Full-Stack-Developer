import { AppBar, Toolbar, Typography, Button, Box, IconButton, useTheme } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import GavelIcon from '@mui/icons-material/Gavel';
import { useEffect, useState } from 'react';
import CheckCircleIcon from '@mui/icons-material/CheckCircle'; // ✅ Add this import

const Header = () => {
  const { user, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);

  // Scroll event listener
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10); // adjust the threshold as needed
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        transition: 'all 0.3s ease',
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        zIndex: 1200,
        backgroundColor: 'transparent',
      }}
    >
      <AppBar
        position="static"
        sx={{
          backgroundColor: '#0b0908',
          boxShadow: 'none',
          borderRadius: 2,
          width: scrolled ? '100%' : '60%',
          maxWidth: '100%',
          mt: scrolled ? 0 : 2,
          transition: 'width 0.4s ease, margin-top 0.4s ease',
        }}
      >
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Box display="flex" alignItems="center">
            <IconButton
              component={Link}
              to="/"
              sx={{
                backgroundColor: '#f7b500',
                borderRadius: '12px',
                mr: 1,
                p: 1,
                '&:hover': {
                  backgroundColor: '#ffcc00',
                },
              }}
            >
              <GavelIcon sx={{ color: '#000' }} />
            </IconButton>
            <Typography
              variant="h6"
              component={Link}
              to="/"
              sx={{
                color: '#fff',
                textDecoration: 'none',
                fontWeight: 'bold',
              }}
            >
              AuctionHub
            </Typography>
          </Box>

          <Box>
            {user ? (
              <>
                {/* ✅ New IconButton for Successful Bids */}
                <IconButton
                  component={Link}
                  to="/sucessbid"
                  sx={{
                    color: '#00e676',
                    mr: 1,
                    '&:hover': {
                      color: '#69f0ae',
                    },
                  }}
                  title="Successful Bids"
                >
                  <CheckCircleIcon />
                </IconButton>

                <Button component={Link} to="/profile" sx={{ color: '#fff' }}>
                  {user.username}
                </Button>
                <Button onClick={logout} sx={{ color: '#fff' }}>
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button component={Link} to="/login" sx={{ color: '#fff', mr: 2 }}>
                  Sign In
                </Button>
                <Button
                  component={Link}
                  to="/register"
                  sx={{
                    backgroundColor: '#f7b500',
                    color: '#000',
                    borderRadius: '8px',
                    textTransform: 'none',
                    fontWeight: 600,
                    '&:hover': {
                      backgroundColor: '#ffcc00',
                    },
                  }}
                >
                  Sign Up
                </Button>
              </>
            )}
          </Box>
        </Toolbar>
      </AppBar>
    </Box>
  );
};

export default Header;
