import axios from 'axios';

const API_URL = '/api/items';

const getItems = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    console.error('Error fetching items:', error);
    throw error;
  }
};

const createItem = async (itemData, token) => {
  try {
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}`,
      },
    };
    const response = await axios.post(API_URL, itemData, config);
    return response.data;
  } catch (error) {
    console.error('Error creating item:', error);
    throw error;
  }
};

const itemsService = {
  getItems,
  createItem,
};

export default itemsService;