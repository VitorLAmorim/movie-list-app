const express = require('express');
const router = express.Router();
const sharedController = require('../controllers/sharedController');

// Criar link de compartilhamento
router.post('/create', sharedController.createShareLink);

// Acessar lista compartilhada
router.get('/:shareToken', sharedController.getSharedList);

// Obter links de compartilhamento do usuário
router.get('/links/user', sharedController.getUserSharedLinks);

// Atualizar data de expiração do link
router.put('/update', sharedController.updateShareExpiration);

// Deletar link de compartilhamento
router.delete('/delete', sharedController.deleteShareLink);

module.exports = router;