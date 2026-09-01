import api from './client';

export const reviewApi = {
  create: (data) => api.post('/reviews', data),
  forTechnician: (userId, params) => api.get(`/reviews/technician/${userId}`, { params }),
  reply: (id, text) => api.put(`/reviews/${id}/reply`, { text }),
};

export const passportApi = {
  create: (data) => api.post('/service-passport', data),
  mine: () => api.get('/service-passport'),
  getById: (id) => api.get(`/service-passport/${id}`),
  update: (id, data) => api.put(`/service-passport/${id}`, data),
  remove: (id) => api.delete(`/service-passport/${id}`),
  addHistory: (id, data) => api.post(`/service-passport/${id}/history`, data),
};

export const notificationApi = {
  mine: (params) => api.get('/notifications', { params }),
  markRead: (id) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/read-all'),
};
