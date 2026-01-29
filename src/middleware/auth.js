import jwt from 'jsonwebtoken';
import User from '../models/User.js';


export const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ message: 'Token mancante' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Token non fornito correttamente' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: 'Utente non valido' });
    }

    // passiamo l'utente loggato ai controller
    req.loggedUser = user;
    next();
  } catch (err) {
    console.error('Errore authMiddleware:', err);
    return res.status(401).json({ message: 'Token non valido' });
  }
};
