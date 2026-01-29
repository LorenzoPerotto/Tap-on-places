const isComune = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Utente non autenticato' });
  }

  if (req.user.tipo !== 'comunale') {
    return res.status(403).json({ message: 'Accesso negato: riservato agli utenti comunali' });
  }

  next();
};

export { isComune };
