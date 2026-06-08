import api from './api';

const adminService = {
  getAnalytics: () => api.get('/admin/analytics'),
  getQuestions: (params) => api.get('/admin/questions', { params }),
  createQuestion: (data) => api.post('/admin/questions', data),
  updateQuestion: (id, data) => api.put(`/admin/questions/${id}`, data),
  deleteQuestion: (id) => api.delete(`/admin/questions/${id}`),
  getStudents: (params) => api.get('/admin/students', { params }),
  getStudentDetail: (id) => api.get(`/admin/students/${id}`),
  getQuestionStats: () => api.get('/admin/questions/stats'),
  getRankings: () => api.get('/admin/rankings'),
  toggleResumeAttempt: (id) => api.post(`/admin/attempts/${id}/toggle-resume`),
  forceSuspendAttempt: (id) => api.post(`/admin/attempts/${id}/suspend`),
};

export default adminService;
