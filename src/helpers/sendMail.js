const sgMail = require("@sendgrid/mail");
require("dotenv").config();

const { SENDGRID_API_KEY, SENDGRID_EMAIL } = process.env;

sgMail.setApiKey(SENDGRID_API_KEY);

const sendMail = async (data) => {
  const mail = { ...data, from: SENDGRID_EMAIL };
  await sgMail.send(mail);
  return true;
};

module.exports = sendMail;
