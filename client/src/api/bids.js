import axios from 'axios';

const API_URL = '/api/bids';

// Place a bid with amount - now properly validates amount on backend
const placeBid = async (itemId, amount, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  
  // Validate amount on frontend too
  if (!amount || amount <= 0) {
    throw new Error('Bid amount must be greater than 0');
  }
  
  const response = await axios.post(API_URL, { itemId, amount }, config);
  return response.data;
};

// Get successful bids for current user
const getSuccessfulBids = async (token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const response = await axios.get(`${API_URL}/successful`, config);
  return response.data;
};

// Get all successful bids (public/admin view)
const getAllSuccessfulBids = async (token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const response = await axios.get(`${API_URL}/all-successful`, config);
  return response.data;
};

// Get bid history for an item
const getBidHistory = async (itemId, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const response = await axios.get(`${API_URL}/history/${itemId}`, config);
  return response.data;
};

const bidsService = {
  placeBid,
  getSuccessfulBids,
  getAllSuccessfulBids,
  getBidHistory,
};

export default bidsService;