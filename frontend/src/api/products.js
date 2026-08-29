import client from './client';

export const listProducts = (businessId, params = {}) =>
  client.get(`/businesses/${businessId}/products`, { params }).then((r) => r.data);

export const getProduct = (businessId, productId) =>
  client.get(`/businesses/${businessId}/products/${productId}`).then((r) => r.data);

export const addProduct = (businessId, data) =>
  client.post(`/businesses/${businessId}/products`, data).then((r) => r.data);

export const updateProduct = (businessId, productId, data) =>
  client.put(`/businesses/${businessId}/products/${productId}`, data).then((r) => r.data);

export const deleteProduct = (businessId, productId) =>
  client.delete(`/businesses/${businessId}/products/${productId}`).then((r) => r.data);
