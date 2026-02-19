/**
 * @file chat.js
 * @description Routes API REST pour le chat des sessions collaboratives.
 */

const express = require('express');
const path = require('path');
const crypto = require('crypto');
const fs = require('fs');
const multer = require('multer');
const router = express.Router();
const chatController = require('../controllers/chatController');
const auth = require('../middleware/auth');

const uploadBasePath = process.env.UPLOAD_BASE_PATH || path.join(process.cwd(), 'uploads', 'chat');

const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		fs.mkdirSync(uploadBasePath, { recursive: true });
		cb(null, uploadBasePath);
	},
	filename: (req, file, cb) => {
		const extension = path.extname(file.originalname || '');
		const fileName = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}${extension}`;
		cb(null, fileName);
	}
});

const upload = multer({
	storage,
	limits: {
		fileSize: Number(process.env.MAX_UPLOAD_SIZE_BYTES || 10 * 1024 * 1024)
	}
});

router.use(auth);

router.post('/upload', upload.single('file'), chatController.uploadFile);
router.get('/:sessionId/messages', chatController.getMessages);
router.get('/:sessionId/participants', chatController.getParticipants);
router.get('/:sessionId/mentions', chatController.getMentionSuggestions);
router.get('/:sessionId/whiteboard-state', chatController.getWhiteboardState);

module.exports = router;
