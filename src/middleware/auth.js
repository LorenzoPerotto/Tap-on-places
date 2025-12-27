const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ message: 'Token mancante' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: 'Utente non valido' });
    }

    req.user = user;   // 🔥 lo user passa ai controller
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token non valido' });
  }
};

module.exports = authMiddleware;