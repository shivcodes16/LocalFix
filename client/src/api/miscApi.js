import api from './client';

export const categoryApi = {
  list: () => api.get('/categories'),
};

export const userApi = {
  updateMe: (data) => api.put('/users/me', data),
  uploadAvatar: (formData) =>
    api.post('/users/me/avatar', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getById: (id) => api.get(`/users/${id}`),
};

export const technicianApi = {
  getMyProfile: () => api.get('/technicians/me'),
  updateMyProfile: (data) => api.put('/technicians/me', data),
  uploadWorkImages: (formData) =>
    api.post('/technicians/me/work-images', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  search: (params) => api.get('/technicians', { params }),
  getPublicProfile: (userId) => api.get(`/technicians/${userId}`),
};
