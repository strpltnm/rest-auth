const ApiError = require("../exceptions/apiError");
const sessionService = require("../services/sessionService");

module.exports = async (req, res, next) => {
	try {
		const authHeader = req.headers.authorization;
		if (!authHeader) {
			return next(ApiError.Unauthorized());
		}

		const accessToken = authHeader.split(' ')[1];

		if (!accessToken) {
			return next(ApiError.Unauthorized());
		}

		const userId = await sessionService.checkAccess(accessToken, req.fingerprint);
		req.userId = userId;
		next();
	} catch (error) {
		return next(ApiError.Unauthorized());
	}
}