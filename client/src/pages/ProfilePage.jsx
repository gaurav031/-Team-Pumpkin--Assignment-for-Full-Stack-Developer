import { Container, Typography, Box, Button } from '@mui/material';
import { useAuth } from '../context/AuthContext';

const ProfilePage = () => {
  const { user, logout } = useAuth();

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography component="h1" variant="h5">
          Profile
        </Typography>
        <Box sx={{ mt: 4, width: '100%' }}>
          <Typography variant="h6">Username: {user?.username}</Typography>
          <Typography variant="h6">Email: {user?.email}</Typography>
          <Button
            variant="contained"
            color="error"
            onClick={logout}
            sx={{ mt: 4 }}
          >
            Logout
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default ProfilePage;