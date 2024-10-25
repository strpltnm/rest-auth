const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcrypt');
const sessionService = require('./sessionService');
const ApiError = require('../exceptions/apiError');

class UserService {
	async registration(id, password, fingerprint) {
		const existUser = await prisma.user.findFirst({ where: { id } });

		if (existUser) {
			throw ApiError.BadRequest(`User ${id} already exists`);
		}

		const hashPassword = await bcrypt.hash(password, 4)
		const user = await prisma.user.create({ data: { id, password: hashPassword } });

		const tokens = await sessionService.newSession(user.id, fingerprint);
		return { ...tokens };
	}

	async login(id, password, fingerprint) {
		const user = await prisma.user.findFirst({ where: { id } });

		if (!user) {
			throw ApiError.BadRequest(`User ${id} is not exist`);
		}

		const isPasswordMatch = await bcrypt.compare(password, user.password);
		if (!isPasswordMatch) {
			throw ApiError.BadRequest('Wrong password');
		}

		const tokens = await sessionService.newSession(user.id, fingerprint);
		return { ...tokens };
	}

	async logout(refresh) {
		await sessionService.deleteSessionByRefresh(refresh);
	}

	async refreshToken(refresh, fingerprint) {
		const tokens = await sessionService.refreshSession(refresh, fingerprint);
		return { ...tokens };
	}

	async info(userId) {
		return await prisma.user.findFirst({ where: { id: userId } });
	}
}

module.exports = new UserService();