const ApiError = require('../exceptions/apiError');
const fileService = require('../services/fileService');

class FileController {
	async uploadFile(req, res, next) {

		try {
			const file = req.file;
			if (!file) {
				throw ApiError.BadRequest('File not found in request')
			}
			const savedFile = await fileService.uploadFile(file);
			res.status(201).json(savedFile);
		} catch (err) {
			next(err);
		}
	};

	async getFileList(req, res, next) {
		try {
			const { page = 1, list_size = 10 } = req.query;
			const fileList = await fileService.getFileList(Number(page), Number(list_size));
			res.json(fileList);
		} catch (err) {
			next(err);
		}
	};

	async deleteFile(req, res, next) {
		try {
			const { id } = req.params;
			if (!parseInt(id)) {
				throw ApiError.BadRequest('invalid params');
			}
			await fileService.deleteFile(Number(id));
			res.status(204).end();
		} catch (err) {
			next(err);
		}
	};

	async getFileInfo(req, res, next) {
		try {
			const { id } = req.params;
			if (!parseInt(id)) {
				throw ApiError.BadRequest('invalid params');
			}
			const file = await fileService.getFileInfo(Number(id));
			res.json(file);
		} catch (err) {
			next(err);
		}
	};

	async downloadFile(req, res, next) {
		try {
			const { id } = req.params;
			if (!parseInt(id)) {
				throw ApiError.BadRequest('invalid params');
			}
			const { filePath, mimeType } = await fileService.downloadFile(Number(id));
			res.download(filePath, { headers: { 'Content-Type': mimeType } });
		} catch (err) {
			next(err);
		}
	};

	async updateFile(req, res, next) {
		try {
			const { id } = req.params;
			if (!parseInt(id)) {
				throw ApiError.BadRequest('invalid params');
			}
			const newFile = req.file;
			if (!newFile) {
				throw ApiError.BadRequest('File not found in request')
			}
			const updatedFile = await fileService.updateFile(Number(id), newFile);
			res.json(updatedFile);
		} catch (err) {
			next(err);
		}
	};
}

module.exports = new FileController();