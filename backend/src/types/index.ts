export interface User {
  id: number;
  username: string;
  password_hash: string;
  created_at: string;
}

export interface Favorite {
  id: number;
  user_id: number;
  movie_id: number;
  movie_title: string;
  movie_poster: string | null;
  movie_rating: number | string;
  movie_release_date: string;
  movie_overview: string;
  added_at: string;
}

export interface SharedList {
  id: number;
  user_id: number;
  share_token: string;
  created_at: string;
  expires_at: string | null;
  username?: string;
}

export interface SharedListItem {
  id: number;
  shared_list_id: number;
  movie_id: number;
  title: string;
  poster_path: string | null;
  release_date: string;
  vote_average: number;
  added_at: string;
}

export interface TMDBMovie {
  id: number;
  title: string;
  poster_path: string | null;
  release_date: string;
  vote_average: number;
  overview: string;
  genre_ids: number[];
}

export interface DatabaseResult {
  rows: any[];
  rowCount: number;
}

export interface ExpressRequest<P = any, Q = any, B = any> {
  params: P;
  query: Q;
  body: B;
  user?: User;
}

export interface ExpressResponse {
  status: (code: number) => ExpressResponse;
  json: (data: any) => ExpressResponse;
}