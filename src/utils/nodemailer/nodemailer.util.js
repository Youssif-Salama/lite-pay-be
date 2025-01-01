import nodemailer from "nodemailer";
import env from "dotenv";
import { generateOtp } from "../../services/Otp.services.js";
import { makeToken } from "../jwt/jwt.utils.js";
env.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.Email_User,
    pass: process.env.Email_App_Pass,
  },
});

export const sendEmail = async (email,otp) => {
  try {

    const mailOptions = {
      from: process.env.Email_User,
      to: email,
      subject: "reset password on lite pay",
      html:`
      <div>
      <h1>Lite Pay</h1>
      <p> This email for reset password </p>
      <p> Copy this otp </p>
      <p>${otp}</p>
      </div>
      `
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending email:", error);
  }
};


export const sendOtpEmail = async (otp,email) => {
  try {
    const mailOptions = {
      from: process.env.Email_User,
      to: email,
      subject: "authenticate your account lite pay",
      html:`
      <div>
      <h1>Lite Pay</h1>
      <p> This email for authenticate your account </p>
      <p> Copy this otp</p>
      <p>${otp}</p>
      </div>
      `
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending email:", error);
  }
};