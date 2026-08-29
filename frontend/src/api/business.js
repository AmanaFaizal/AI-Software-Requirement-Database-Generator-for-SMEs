import client from './client';

export const createBusiness = (data) => client.post('/businesses', data).then((r) => r.data);
export const listBusinesses = () => client.get('/businesses').then((r) => r.data);
export const getBusiness = (id) => client.get(`/businesses/${id}`).then((r) => r.data);
export const updateBusiness = (id, data) => client.put(`/businesses/${id}`, data).then((r) => r.data);
export const deleteBusiness = (id) => client.delete(`/businesses/${id}`).then((r) => r.data);
