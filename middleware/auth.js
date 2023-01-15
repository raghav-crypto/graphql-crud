const jwt = require('jsonwebtoken');

module.exports = async (req, res, next) => {
    let token;
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        token = req.headers.authorization.split(' ')[1];
    }
    if (!token) {
        req.isAuth = false;
        return next();
    }
    try {
        // Verify tokenss   
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        req.isAuth = true
        return next();
    } catch (err) {
        req.isAuth = false;
        return next();
    }
};
