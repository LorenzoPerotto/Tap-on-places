const isComune = (req, res, next) => {
  if (req.user.tipo !== 'comunale') {
    return res.status(403).json({ message: 'Accesso negato' });
  }
  next();
};

module.exports = { isComune };