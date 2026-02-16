export function validateEmail(email) {
  if (!email) {
    return {
      valid: false,
      error: 'Email obbligatoria'
    }
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return {
      valid: false,
      error: 'Email non valida'
    }
  }

  return {
    valid: true,
    error: null
  }
}

export function validateRegistrationData(data) {
  const errors = {}

  // Validazione email
  if (!data.email) {
    errors.email = 'Email obbligatoria'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = 'Email non valida'
  }

  // Validazione password
  if (!data.password) {
    errors.password = 'Password obbligatoria'
  } else if (data.password.length < 6) {
    errors.password = 'Password troppo corta (min 6 caratteri)'
  }

  // Validazione nickname
  if (!data.nickname) {
    errors.nickname = 'Nickname obbligatorio'
  }

  // Validazione nome
  if (!data.nome) {
    errors.nome = 'Nome obbligatorio'
  }

  // Validazione cognome
  if (!data.cognome) {
    errors.cognome = 'Cognome obbligatorio'
  }

  // Validazione data di nascita
  if (!data.dataNascita) {
    errors.dataNascita = 'Data di nascita obbligatoria'
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  }
}

export function validateConfirmationCode(code) {
  if (!code) {
    return {
      valid: false,
      error: 'Codice conferma obbligatorio'
    }
  }

  if (code.length < 4) {
    return {
      valid: false,
      error: 'Codice conferma non valido'
    }
  }

  return {
    valid: true,
    error: null
  }
}