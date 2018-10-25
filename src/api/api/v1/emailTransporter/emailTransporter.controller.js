import { config } from '../../../../config/environment';

const mailer = require('nodemailer');

const transport = mailer.createTransport(config.emailTranspoter);
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
        console.info('error while sending email');
        console.error(err);
      } else {
        console.error(json);
      }
    },
  );
}

export default { sendEmail };
