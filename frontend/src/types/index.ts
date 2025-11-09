export interface User {
  id: number;
  username: string;
  created_at: string;
}

export interface Movie {
  id: number;
  title: string;
  originalTitle: string;
  overview: string;
  releaseDate: string;
  rating: number;
  voteCount: number;
  poster: string | null;
  backdrop: string | null;
  genres: Array<{ id: number; name: string }>;
  runtime: number;
  director?: string;
  cast?: string[];
  trailer?: string;
}

export interface Favorite {
  id: number;
  user_id: number;
  movie_id: number;
  movie_title: string;
  movie_poster: string | null;
  movie_rating: number;
  movie_release_date: string;
  movie_overview: string;
  added_at: string;
}

export interface SharedList {
  id: number;
  user_id: number;
  share_token: string;
  expires_at: string | null;
  created_at: string;
  username: string;
}

export interface MovieListResponse {
  movies: Movie[];
  currentPage: number;
  totalPages: number;
  totalResults: number;
  timeWindow?: string;
}

export interface AuthContextType {
  user: User | null;
  login: (username: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  status: number;
}

export interface MovieModalProps {
  movie: Movie;
  isOpen: boolean;
  onClose: () => void;
  onAddToFavorites?: (movie: Movie) => void;
  onRemoveFromFavorites?: (movieId: number) => void;
  isFavorite?: boolean;
}