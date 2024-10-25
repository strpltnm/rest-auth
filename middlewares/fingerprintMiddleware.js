module.exports = (req, res, next) => {
	//very hard fingerprint generation
	req.fingerprint = req.headers['user-agent'] || 'fingerprint';
	next();
}