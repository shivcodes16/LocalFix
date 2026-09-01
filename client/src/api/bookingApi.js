import api from './client';

export const quoteApi = {
  submit: (data) => api.post('/quotes', data),
  forRequest: (serviceRequestId) => api.get(`/quotes/request/${serviceRequestId}`),
  mine: (params) => api.get('/quotes/mine', { params }),
  accept: (id) => api.put(`/quotes/${id}/accept`),
};

export const bookingApi = {
  mine: (params) => api.get('/bookings/mine', { params }),
  getById: (id) => api.get(`/bookings/${id}`),
  start: (id) => api.put(`/bookings/${id}/start`),
  addNote: (id, formData) =>
    api.post(`/bookings/${id}/notes`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  complete: (id, data) => api.put(`/bookings/${id}/complete`, data),
  confirm: (id, data) => api.put(`/bookings/${id}/confirm`, data),
  dispute: (id, data) => api.put(`/bookings/${id}/dispute`, data),
  cancel: (id) => api.put(`/bookings/${id}/cancel`),
};
