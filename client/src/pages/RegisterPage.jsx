import { useState } from 'react';
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Link,
  Avatar,
  Paper,
} from '@mui/material';
import { Gavel } from '@mui/icons-material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const RegisterPage = () => {
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(formData);
      navigate('/');
    } catch (error) {
      console.error('Registration failed:', error);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: '#000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
      }}
    >
      <Container maxWidth="xs">
        <Paper
          elevation={3}
          sx={{
            p: 4,
            background: 'linear-gradient(to bottom, #141414,  #321d1dff)',
            borderRadius: 3,
            width: '100%',
            textAlign: 'center',
          }}
        >
          <Avatar sx={{ bgcolor: '#FFC107', mx: 'auto', mb: 2 }}>
            <Gavel />
          </Avatar>
          <Typography variant="h5" fontWeight="bold" color="white">
            Join AuctionHub
          </Typography>
          <Typography variant="body2" sx={{ color: '#9e9e9e', mb: 2 }}>
            Create your account to start bidding on exclusive items
          </Typography>
          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              margin="normal"
              variant="filled"
              label="Full Name"
              name="username"
              InputProps={{ sx: { backgroundColor: '#000', color: '#fff' } }}
              InputLabelProps={{ sx: { color: '#bbb' } }}
              value={formData.username}
              onChange={handleChange}
            />
            <TextField
              fullWidth
              margin="normal"
              variant="filled"
              label="Email"
              name="email"
              InputProps={{ sx: { backgroundColor: '#000', color: '#fff' } }}
              InputLabelProps={{ sx: { color: '#bbb' } }}
              value={formData.email}
              onChange={handleChange}
            />
            <TextField
              fullWidth
              margin="normal"
              variant="filled"
              label="Password"
              name="password"
              type="password"
              InputProps={{ sx: { backgroundColor: '#000', color: '#fff' } }}
              InputLabelProps={{ sx: { color: '#bbb' } }}
              value={formData.password}
              onChange={handleChange}
            />
            <Button
              fullWidth
              type="submit"
              variant="contained"
              sx={{
                mt: 3,
                mb: 2,
                backgroundColor: '#FFC107',
                color: '#000',
                fontWeight: 'bold',
                '&:hover': { backgroundColor: '#e0a800' },
              }}
            >
              Create Account
            </Button>
            <Typography variant="body2" sx={{ color: '#bbb' }}>
              Already have an account?{' '}
              <Link component={RouterLink} to="/login" sx={{ color: '#FFC107', fontWeight: 500 }}>
                Sign in
              </Link>
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default RegisterPage;