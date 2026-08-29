import client from './client';

export const listReminders = (businessId) =>
  client.get(`/businesses/${businessId}/reminders`).then((r) => r.data);

export const addReminder = (businessId, data) =>
  client.post(`/businesses/${businessId}/reminders`, data).then((r) => r.data);

export const updateReminder = (businessId, reminderId, data) =>
  client.put(`/businesses/${businessId}/reminders/${reminderId}`, data).then((r) => r.data);

export const deleteReminder = (businessId, reminderId) =>
  client.delete(`/businesses/${businessId}/reminders/${reminderId}`).then((r) => r.data);
