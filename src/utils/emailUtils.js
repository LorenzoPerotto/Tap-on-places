import nodemailer from 'nodemailer';

/**
 * Invia il codice di conferma a 4 cifre via email.
 * In sviluppo, se SMTP non è configurato, stampa il codice in console.
 * @param {string} email
 * @param {number} codice
 */
export async function sendConfirmationCode(email, codice) {
  // Se le credenziali SMTP non sono configurate, stampa in console
  if (!process.env.EMAIL_USER || process.env.EMAIL_USER === 'your-email@gmail.com') {
    console.log('========================================');
    console.log(`📧 CODICE DI CONFERMA per ${email}: ${codice}`);
    console.log('========================================');
    console.log('(SMTP non configurato - codice stampato in console)');
    return;
  }

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  const mailOptions = {
    from: `"Tap On Places" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Conferma registrazione',
    text: `Il tuo codice di conferma è: ${codice}`,
    html: `
      <h2>Benvenuto in Tap On Places</h2>
      <p>Il tuo codice di conferma è:</p>
      <h1>${codice}</h1>
      <p>Inseriscilo nell'app per completare la registrazione.</p>
    `
  };

  await transporter.sendMail(mailOptions);
}
