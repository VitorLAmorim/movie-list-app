import { Router } from 'express';
import favoriteController from '../controllers/favoriteController';

const router = Router();

// Adicionar filme aos favoritos
router.post('/add/:movieId', favoriteController.addFavorite);

// Remover filme dos favoritos
router.delete('/remove', favoriteController.removeFavorite);

// Obter lista de favoritos de um usuário
router.get('/list', favoriteController.getFavorites);

// Verificar se um filme está nos favoritos
router.get('/check', favoriteController.checkFavorite);

export default router;