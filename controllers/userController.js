require('dotenv').config();
const ApiError = require('../exceptions/apiError');
const userService = require('../services/userService');

class UserController {
	async register(req, res, next) {
		try {
			const { id, password } = req.body;
			if (!id || !password) {
				throw ApiError.BadRequest('not all values ​​were received');
			}

			const { access, refresh } = await userService.registration(id, password, req.fingerprint);

			res.cookie('refreshToken', refresh, { httpOnly: true })
			res.status(201).json(access);
		} catch (err) {
			next(err);
		}
	}

	async signin(req, res, next) {
		try {
			const { id, password } = req.body;
			if (!id || !password) {
				throw ApiError.BadRequest('not all values ​​were received');
			}
			const { access, refresh } = await userService.login(id, password, req.fingerprint);
			res.cookie('refreshToken', refresh, { httpOnly: true });
			res.status(200).json(access);
		} catch (err) {
			next(err);
		}
	}

	async newToken(req, res, next) {
		try {
			const { refreshToken } = req.cookies;

			if (!refreshToken) {
				throw ApiError.Unauthorized();
			}

			const { access, refresh } = await userService.refreshToken(refreshToken, req.fingerprint);
			res.cookie('refreshToken', refresh, { httpOnly: true });
			res.status(200).json(access);
		} catch (err) {
			next(err);
		}
	}

	async logout(req, res, next) {
		try {
			const { refreshToken } = req.cookies;

			if (!refreshToken) {
				return res.status(200);
			}

			await userService.logout(refreshToken);
			res.clearCookie('refreshToken');
			res.status(200).end();
		} catch (err) {
			next(err);
		}
	}

	async info(req, res, next) {
		try {
			const { id } = await userService.info(req.userId);
			res.json(id);
		} catch (err) {
			next(err);
		}
	}
}

module.exports = new UserController();