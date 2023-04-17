require('dotenv').config();
const secret = process.env.JWT_TOKEN;

const jwt = require('jsonwebtoken');

const user = require('../models/user');

const withAuth = (req, res, next) => {
    const token = req.headers['x-access-token'];
    if(!token) {
        res.status(203).json({error: 'No token provider.'});
    } else {
        jwt.verify(token, secret, (e, decode) => {
            if(e) {
            res.status(203).json({error: "Unauthorized: token invalid"});
            } else {
                req.email = decode.email;
                user.findOne({email: req.email})
                .then(user => {
                    req.user = user;
                    next();
                })
                .catch(e => {
                    res.status(203).json({error: "Fail in user search"});
                });
            }
        });
    }
}

module.exports = withAuth;