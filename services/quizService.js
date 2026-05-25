import api from './api';

const quizService = {
  startQuiz: () => api.post('/quiz/start'),
  submitQuiz: (attemptId, data) => api.post(`/quiz/submit/${attemptId}`, data),
  getAttempts: (params) => api.get('/quiz/attempts', { params }),
  getAttemptById: (id) => api.get(`/quiz/attempts/${id}`),
  abandonQuiz: (id) => api.patch(`/quiz/attempts/${id}/abandon`),
};

export default quizService;
