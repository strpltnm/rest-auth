const express = require('express');
const fileController = require('../controllers/fileController');
const router = express.Router();

router.post('/upload', fileController.uploadFile);
router.get('/list', fileController.getFileList);
router.delete('/delete/:id', fileController.deleteFile);
router.get('/:id', fileController.getFileInfo);
router.get('/download/:id', fileController.downloadFile);
router.put('/update/:id', fileController.updateFile);

module.exports = router;