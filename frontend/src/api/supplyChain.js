import client from './client';

// --- Categories ---
export const listCategories = (businessId) =>
  client.get(`/businesses/${businessId}/categories`).then((r) => r.data);

export const addCategory = (businessId, data) =>
  client.post(`/businesses/${businessId}/categories`, data).then((r) => r.data);

export const updateCategory = (businessId, categoryId, data) =>
  client.put(`/businesses/${businessId}/categories/${categoryId}`, data).then((r) => r.data);

export const deleteCategory = (businessId, categoryId) =>
  client.delete(`/businesses/${businessId}/categories/${categoryId}`).then((r) => r.data);


// --- Dealers ---
export const listDealers = (businessId) =>
  client.get(`/businesses/${businessId}/dealers`).then((r) => r.data);

export const addDealer = (businessId, data) =>
  client.post(`/businesses/${businessId}/dealers`, data).then((r) => r.data);

export const updateDealer = (businessId, dealerId, data) =>
  client.put(`/businesses/${businessId}/dealers/${dealerId}`, data).then((r) => r.data);

export const deleteDealer = (businessId, dealerId) =>
  client.delete(`/businesses/${businessId}/dealers/${dealerId}`).then((r) => r.data);


// --- Purchases (Buyed Stocks) ---
export const listPurchases = (businessId) =>
  client.get(`/businesses/${businessId}/purchases`).then((r) => r.data);

export const addPurchase = (businessId, data) =>
  client.post(`/businesses/${businessId}/purchases`, data).then((r) => r.data);

export const updatePurchaseStatus = (businessId, purchaseId, data) =>
  client.put(`/businesses/${businessId}/purchases/${purchaseId}/status`, data).then((r) => r.data);


// --- Invoices ---
export const listInvoices = (businessId) =>
  client.get(`/businesses/${businessId}/invoices`).then((r) => r.data);


// --- Reports ---
export const getSalesReport = (businessId) =>
  client.get(`/businesses/${businessId}/reports/sales`).then((r) => r.data);

// Sales
export const listSales = (businessId) =>
  client.get(`/businesses/${businessId}/sales`).then((r) => r.data);

export const addSale = (businessId, data) =>
  client.post(`/businesses/${businessId}/sales`, data).then((r) => r.data);

// Expenses
export const listExpenses = (businessId) =>
  client.get(`/businesses/${businessId}/expenses`).then((r) => r.data);

export const addExpense = (businessId, data) =>
  client.post(`/businesses/${businessId}/expenses`, data).then((r) => r.data);

export const deleteExpense = (businessId, id) =>
  client.delete(`/businesses/${businessId}/expenses/${id}`).then((r) => r.data);
