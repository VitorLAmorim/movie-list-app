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
  (config: any) => {
    console.log(`Fazendo requisição para: ${config.method?.toUpperCase() || 'GET'} ${config.url}`);
    return config;
  },
  (error: any) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response: any) => {
    return response;
  },
  (error: any) => {
    const errorMessage = error.response?.data?.error || error.message || 'Ocorreu um erro inesperado';
    console.error('Erro na API:', errorMessage);
    return Promise.reject(error);
  }
);

export const movieAPI = {
  searchMovies: (query: string, page: number = 1) =>
    api.get(`/movies/search?query=${encodeURIComponent(query)}&page=${page}`),

  getMovieDetails: (movieId: number) =>
    api.get(`/movies/${movieId}`),

  getPopularMovies: (page: number = 1) =>
    api.get(`/movies/popular/list?page=${page}`),

  getTrendingMovies: (timeWindow: string = 'week', page: number = 1) =>
    api.get(`/movies/trending/list?timeWindow=${timeWindow}&page=${page}`),
};

export const favoritesAPI = {
  addFavorite: (username: string, movieId: number, movieData: any) =>
    api.post(`/favorites/add/${movieId}`, { username, movieData }),

  removeFavorite: (username: string, movieId: number) =>
    api.delete('/favorites/remove', { data: { username, movieId } }),

  getFavorites: (username: string) =>
    api.get(`/favorites/list?username=${username}`),

  checkFavorite: (username: string, movieId: number) =>
    api.get(`/favorites/check?username=${username}&movieId=${movieId}`),
};

export const sharedAPI = {
  createShareLink: (username: string, expiresDays: number = 30) =>
    api.post('/shared/create', { username, expiresDays }),

  getSharedList: (shareToken: string) =>
    api.get(`/shared/${shareToken}`),

  getUserSharedLinks: (username: string) =>
    api.get(`/shared/links/user?username=${username}`),

  updateShareExpiration: (username: string, shareToken: string, expiresDays: number) =>
    api.put('/shared/update', { username, shareToken, expiresDays }),

  deleteShareLink: (username: string, shareToken: string) =>
    api.delete('/shared/delete', { data: { username, shareToken } }),
};

export const authAPI = {
  register: (username: string, password: string) =>
    api.post('/auth/register', { username, password }),

  login: (username: string, password: string) =>
    api.post('/auth/login', { username, password }),

  setPassword: (userId: number, password: string) =>
    api.post('/auth/set-password', { userId, password }),
};

export default api;