import { useState } from 'react';
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Avatar,
  FormHelperText,
  Paper,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import itemsService from '../api/items';

const CreateItemPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startingPrice: 101,
    image: null,
  });
  const [errors, setErrors] = useState({});
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Item name is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    const price = Number(formData.startingPrice);
    if (isNaN(price) || price <= 100) {
      newErrors.startingPrice = 'Starting price must be a number greater than 100';
    }
    
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Clear submit error when user starts typing
    if (submitError) {
      setSubmitError('');
    }

    // Real-time validation for starting price
    if (name === 'startingPrice') {
      const price = Number(value);
      const newErrors = { ...errors };
      
      if (value === '' || isNaN(price)) {
        newErrors.startingPrice = 'Must be a number';
      } else if (price <= 100) {
        newErrors.startingPrice = 'Starting price must be more than 100';
      } else {
        delete newErrors.startingPrice;
      }
      
      setErrors(newErrors);
    } else {
      // Clear error for other fields when user starts typing
      if (errors[name]) {
        const newErrors = { ...errors };
        delete newErrors[name];
        setErrors(newErrors);
      }
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setErrors({ ...errors, image: 'Please select a valid image file' });
        return;
      }
      
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setErrors({ ...errors, image: 'Image size must be less than 5MB' });
        return;
      }
      
      setFormData({
        ...formData,
        image: file,
      });

      // Clear image error
      if (errors.image) {
        const newErrors = { ...errors };
        delete newErrors.image;
        setErrors(newErrors);
      }

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    // Check if user is authenticated
    if (!user || !user.token) {
      setSubmitError('You must be logged in to create an item');
      return;
    }

    setLoading(true);
    setSubmitError('');

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name.trim());
      formDataToSend.append('description', formData.description.trim());
      formDataToSend.append('startingPrice', formData.startingPrice);
      
      if (formData.image) {
        formDataToSend.append('image', formData.image);
      }

      await itemsService.createItem(formDataToSend, user.token);
      navigate('/');
    } catch (error) {
      console.error('Error creating item:', error);
      
      // Handle different types of errors
      if (error.response?.data?.message) {
        setSubmitError(error.response.data.message);
      } else if (error.response?.status === 401) {
        setSubmitError('Authentication failed. Please log in again.');
      } else if (error.response?.status === 400) {
        setSubmitError('Invalid data provided. Please check your inputs.');
      } else {
        setSubmitError('Failed to create item. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = () => {
    return (
      formData.name.trim() &&
      formData.description.trim() &&
      Number(formData.startingPrice) > 100 &&
      Object.keys(errors).length === 0
    );
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
      <Container maxWidth="sm">
        <Paper
          elevation={3}
          sx={{
            p: 4,
            background: 'linear-gradient(to bottom, #141414, #321d1dff)',
            borderRadius: 3,
            width: '100%',
            textAlign: 'center',
          }}
        >
          <Typography variant="h5" fontWeight="bold" color="white" gutterBottom>
            Create New Auction Item
          </Typography>
          
          {submitError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {submitError}
            </Alert>
          )}
          
          <Box component="form" onSubmit={handleSubmit}>
            {preview && (
              <Avatar
                src={preview}
                alt="Preview"
                sx={{ width: 200, height: 200, mb: 2, mx: 'auto' }}
                variant="rounded"
              />
            )}
            
            <Button
              variant="contained"
              component="label"
              fullWidth
              sx={{
                mb: 2,
                backgroundColor: '#FFC107',
                color: '#000',
                fontWeight: 'bold',
                '&:hover': { backgroundColor: '#e0a800' },
              }}
            >
              Upload Image
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={handleImageChange}
              />
            </Button>
            
            {errors.image && (
              <FormHelperText error sx={{ textAlign: 'left', mb: 1 }}>
                {errors.image}
              </FormHelperText>
            )}

            <TextField
              margin="normal"
              required
              fullWidth
              id="name"
              label="Item Name"
              name="name"
              autoComplete="off"
              error={!!errors.name}
              helperText={errors.name}
              InputProps={{ sx: { backgroundColor: '#000', color: '#fff' } }}
              InputLabelProps={{ sx: { color: '#bbb' } }}
              FormHelperTextProps={{ sx: { color: 'error.main' } }}
              value={formData.name}
              onChange={handleChange}
            />

            <TextField
              margin="normal"
              required
              fullWidth
              id="description"
              label="Description"
              name="description"
              autoComplete="off"
              multiline
              rows={4}
              error={!!errors.description}
              helperText={errors.description}
              InputProps={{ sx: { backgroundColor: '#000', color: '#fff' } }}
              InputLabelProps={{ sx: { color: '#bbb' } }}
              FormHelperTextProps={{ sx: { color: 'error.main' } }}
              value={formData.description}
              onChange={handleChange}
            />

            <TextField
              margin="normal"
              required
              fullWidth
              id="startingPrice"
              label="Starting Price"
              name="startingPrice"
              type="number"
              autoComplete="off"
              error={!!errors.startingPrice}
              InputProps={{
                sx: { backgroundColor: '#000', color: '#fff' },
                inputProps: { min: 101, step: 1 },
              }}
              InputLabelProps={{ sx: { color: '#bbb' } }}
              value={formData.startingPrice}
              onChange={handleChange}
            />
            {errors.startingPrice && (
              <FormHelperText error sx={{ textAlign: 'left', mb: 1 }}>
                {errors.startingPrice}
              </FormHelperText>
            )}

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={!isFormValid() || loading}
              sx={{
                mt: 3,
                backgroundColor: '#FFC107',
                color: '#000',
                fontWeight: 'bold',
                '&:hover': { backgroundColor: '#e0a800' },
                '&:disabled': { 
                  backgroundColor: '#666', 
                  color: '#999' 
                },
              }}
            >
              {loading ? (
                <>
                  <CircularProgress size={20} sx={{ mr: 1, color: '#000' }} />
                  Creating...
                </>
              ) : (
                'Create Item'
              )}
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default CreateItemPage;