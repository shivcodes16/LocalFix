import api from './client';

export const serviceRequestApi = {
  classify: (description) => api.post('/service-requests/classify', { description }),
  create: (formData) =>
    api.post('/service-requests', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  mine: (params) => api.get('/service-requests/mine', { params }),
  open: () => api.get('/service-requests/open'),
  getById: (id) => api.get(`/service-requests/${id}`),
  cancel: (id) => api.put(`/service-requests/${id}/cancel`),
};
