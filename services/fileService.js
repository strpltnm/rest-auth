const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const fs = require('fs');
const path = require('path');
const ApiError = require('../exceptions/apiError');

class FileService {
	async uploadFile(file) {
		const filePath = path.join(__dirname, '..', 'uploads', file.filename);

		return await prisma.file.create({
			data: {
				name: file.originalname,
				extension: path.extname(file.originalname),
				mimeType: file.mimetype,
				size: file.size,
				filePath: filePath,
			},
		});
	}

	async getFileList(page, listSize) {
		const skip = (page - 1) * listSize;
		return await prisma.file.findMany({
			skip: skip,
			take: listSize,
		});
	}

	async deleteFile(id) {
		const file = await prisma.file.findUnique({ where: { id } });
		if (file) {
			fs.unlinkSync(file.filePath);
			await prisma.file.delete({ where: { id } });
		} else {
			throw ApiError.BadRequest('File not found');
		}
	}

	async getFileInfo(id) {
		const file = await prisma.file.findUnique({ where: { id } });
		if (!file) {
			throw ApiError.BadRequest('File not found');
		}

		return file;
	}

	async downloadFile(id) {
		const file = await prisma.file.findUnique({ where: { id } });
		if (!file) {
			throw ApiError.BadRequest('File not found');
		}
		return { filePath: file.filePath, mimeType: file.mimeType };
	}

	async updateFile(id, newFile) {
		const oldFile = await prisma.file.findUnique({ where: { id } });
		if (oldFile) {
			fs.unlinkSync(oldFile.filePath);

			const newFilePath = path.join(__dirname, '..', 'uploads', newFile.filename);

			return await prisma.file.update({
				where: { id },
				data: {
					name: newFile.originalname,
					extension: path.extname(newFile.originalname),
					mimeType: newFile.mimetype,
					size: newFile.size,
					filePath: newFilePath,
				},
			});
		} else {
			fs.unlinkSync(path.join(__dirname, '..', 'uploads', newFile.filename));
			throw ApiError.BadRequest('File for update not found');
		}
	}
}

module.exports = new FileService();