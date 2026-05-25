import api from './api';

const reportService = {
  generate: (attemptId) => api.post(`/reports/generate/${attemptId}`),
  get: (attemptId) => api.get(`/reports/${attemptId}`),
  getAll: () => api.get('/reports'),
};

export default reportService;
