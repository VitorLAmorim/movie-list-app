import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    console.log(`Fazendo requisição para: ${config.method.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const errorMessage = error.response?.data?.error || error.message || 'Ocorreu um erro inesperado';
    console.error('Erro na API:', errorMessage);
    return Promise.reject(error);
  }
);

export const movieAPI = {
  searchMovies: (query, page = 1) =>
    api.get(`/movies/search?query=${encodeURIComponent(query)}&page=${page}`),

  getMovieDetails: (movieId) =>
    api.get(`/movies/${movieId}`),

  getPopularMovies: (page = 1) =>
    api.get(`/movies/popular/list?page=${page}`),

  getTrendingMovies: (timeWindow = 'week', page = 1) =>
    api.get(`/movies/trending/list?timeWindow=${timeWindow}&page=${page}`),
};

export const favoritesAPI = {
  addFavorite: (username, movieId, movieData) =>
    api.post(`/favorites/add/${movieId}`, { username, movieData }),

  removeFavorite: (username, movieId) =>
    api.delete('/favorites/remove', { data: { username, movieId } }),

  getFavorites: (username) =>
    api.get(`/favorites/list?username=${username}`),

  checkFavorite: (username, movieId) =>
    api.get(`/favorites/check?username=${username}&movieId=${movieId}`),
};

export const sharedAPI = {
  createShareLink: (username, expiresDays = 30) =>
    api.post('/shared/create', { username, expiresDays }),

  getSharedList: (shareToken) =>
    api.get(`/shared/${shareToken}`),

  getUserSharedLinks: (username) =>
    api.get(`/shared/links/user?username=${username}`),

  updateShareExpiration: (username, shareToken, expiresDays) =>
    api.put('/shared/update', { username, shareToken, expiresDays }),

  deleteShareLink: (username, shareToken) =>
    api.delete('/shared/delete', { data: { username, shareToken } }),
};

export default api;