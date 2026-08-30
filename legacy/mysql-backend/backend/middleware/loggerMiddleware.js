const morgan = require("morgan");
function requestLogger(req, res, next) { req.requestTime = new Date().toISOString(); next(); }
const morganMiddleware = morgan("combined");
module.exports = { requestLogger, morganMiddleware };
