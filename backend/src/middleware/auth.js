const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
  const mode = process.env.BIZGUIDE_AUTH_MODE || 'direct';
  if (!['direct', 'gateway'].includes(mode)) {
    return res.status(500).json({ message: 'Invalid authentication configuration.' });
  }
  // Gateway mode is a server configuration, never selected by a client header.
  // Authorization belongs to WSO2 in this mode; it is not a BizGuide identity.
  const headerName = mode === 'gateway' ? 'x-bizguide-token' : 'authorization';
  const header = req.headers[headerName];
  const occurrences = (req.rawHeaders || []).filter((value, index) =>
    index % 2 === 0 && value.toLowerCase() === headerName).length;

  if (occurrences > 1 || typeof header !== 'string' || !/^Bearer [^\s,]+$/.test(header) ||
      (mode === 'direct' && req.headers['x-bizguide-token'] !== undefined)) {
    return res.status(401).json({ message: 'No token provided. Please log in.' });
  }

  const token = header.split(' ')[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });
    if (!payload || typeof payload !== 'object' ||
        !Number.isSafeInteger(payload.user_id) || payload.user_id <= 0) {
      return res.status(401).json({ message: 'Invalid or expired token.' });
    }
    req.user = payload; // { user_id, email }
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
}

module.exports = authMiddleware;
