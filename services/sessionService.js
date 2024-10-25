require('dotenv').config();
var jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { PrismaClient } = require('@prisma/client');
const ApiError = require('../exceptions/apiError');
const prisma = new PrismaClient();

class SessionService {
	async newSession(userId, fingerprint) {
		const oldSession = await prisma.session.findFirst({ where: { userId, fingerprint } });

		if (oldSession) {
			await prisma.session.delete({ where: { id: oldSession.id } })
		}

		const access = jwt.sign({ userId }, process.env.JWT_SECRET, {
			expiresIn: 600, //10 min
		});

		const refresh = uuidv4();

		const session = await prisma.session.create({
			data: {
				accessToken: access,
				refresh: refresh,
				fingerprint: fingerprint,
				expiresIn: new Date(Date.now() + Number(process.env.REFRESH_MAX_AGE)),
				userId: userId
			}
		});

		return { access: session.accessToken, refresh: session.refresh };
	}

	async refreshSession(refresh, fingerprint) {
		const oldSession = await prisma.session.findFirst({ where: { refresh, fingerprint } });

		if (!oldSession) {
			throw ApiError.Unauthorized();
		}
		if (oldSession.expiresIn < Date.now()) {
			await this.deleteSessionByRefresh(refresh);
			throw ApiError.Unauthorized();
		}
		return await this.newSession(oldSession.userId, fingerprint);
	}

	async checkAccess(accessToken, fingerprint) {
		const { userId } = jwt.verify(accessToken, process.env.JWT_SECRET);
		const session = await prisma.session.findFirst({ where: { accessToken, fingerprint } });

		if (!session) {
			throw ApiError.Unauthorized();
		}

		return userId;
	}

	async deleteSessionByRefresh(refresh) {
		const session = await prisma.session.findFirst({ where: { refresh } });

		if (session) {
			await prisma.session.delete({ where: { id: session.id } });
		}
		return;
	}
}

module.exports = new SessionService();