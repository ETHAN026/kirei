const jwt = require('jsonwebtoken');

function assistantAuthMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentification requise.' });
  }

  const token = header.split(' ')[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (payload.role !== 'assistant') {
      return res.status(403).json({ error: 'Accès réservé aux assistants.' });
    }
    req.assistant = payload; // { id, email, role }
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Session invalide ou expirée.' });
  }
}

module.exports = assistantAuthMiddleware;
