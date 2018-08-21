import { config } from '../../../../config/environment';

const mailer = require('nodemailer');
const smtp = require('nodemailer-smtp-transport');

const transport = mailer.createTransport(
  smtp({
    host: 'in.mailjet.com',
    port: 2525,
    auth: config.emailAuth,
  }),
);
// function to send email
export function sendEmail(fromAddr, toAddr, emailSubject, bodyHtml) {
  transport.sendMail(
    {
      from: fromAddr,
      to: toAddr,
      subject: emailSubject,
      html: bodyHtml,
    },
    (err, json) => {
      if (err) {
        console.error(err);
      } else {
        console.error(json);
      }
    },
  );
}

export default { sendEmail };
