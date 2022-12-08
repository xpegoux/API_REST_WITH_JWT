const jwt = require('jsonwebtoken');

const secret = 'iIsInR5cCI6IkpXVCJ9eyJhbGciOiJIUzI1N';
const sign = payload => jwt.sign(payload, secret, { expiresIn: 86400 }); //86400 = 24h
const verify = token => jwt.verify(token, secret);


module.exports = { sign, verify };