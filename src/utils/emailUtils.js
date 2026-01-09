import nodemailer from 'nodemailer';


const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST || 'smtp.gmail.com',
  port: process.env.MAIL_PORT || 587,
  secure: false, 
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS
  }
});

/**
 * Invia il codice di conferma a 4 cifre via email
 * @param {string} email
 * @param {number} codice
 */
export async function sendConfirmationCode(email, codice) {
  const mailOptions = {
    from: '"Tap On Places" <no-reply@taponplaces.it>',
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
