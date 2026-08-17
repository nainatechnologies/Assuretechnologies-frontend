import axiosInstance from './axiosConfig';

export const productsApi = {
  fetchProducts: async (params?: any) => {
    return axiosInstance.get('/products', { params });
  },
  getCart: async () => {
    return axiosInstance.get('/cart');
  },
  addToCart: async (productId: string, quantity: number = 1) => {
    return axiosInstance.post('/cart/add', { productId, quantity });
  },
  updateCartItem: async (productId: string, quantity: number) => {
    return axiosInstance.put('/cart/update', { productId, quantity });
  },
  removeFromCart: async (productId: string) => {
    return axiosInstance.delete(`/cart/remove/${productId}`);
  }
};
