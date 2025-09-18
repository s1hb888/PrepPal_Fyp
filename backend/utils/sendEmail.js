const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // Use Gmail App Password if 2FA enabled
  },
  tls: { rejectUnauthorized: false },
});

// ---------------------------
// Send verification email
const sendVerificationEmail = async ({ to, token }) => {
  try {
    // Use backend environment variable, not hardcoded
    const verifyUrl = `${process.env.FRONTEND_URL}/api/verify-email?token=${token}&email=${to}`;

    const htmlMessage = `
      <p>Thank you for registering on <strong>PrepPal</strong>!</p>
      <p><strong>Verify your account:</strong></p>
      <p>
        Click the link below to verify your email:
        <br/>
        <a href="${verifyUrl}">Verify my account</a>
      </p>
      <p>Happy Learning!<br/>– PrepPal Team</p>
    `;

    await transporter.sendMail({
      from: `"PrepPal" <${process.env.EMAIL_USER}>`,
      to,
      subject: "Verify your PrepPal account",
      html: htmlMessage,
    });

  } catch (error) {
    console.error("❌ Verification email not sent:", error);
    throw error;
  }
};


// ---------------------------
// Send password reset email
// ---------------------------
const sendResetPasswordEmail = async ({ to, token }) => {
  try {
    const resetMessage = `
      <p>Hello,</p>
      <p>You requested a password reset on <strong>PrepPal</strong>.</p>
      <p>Use the following token to reset your password in the app:</p>
      <h3>${token}</h3>
      <p>If this wasn't you, ignore this email.</p>
    `;

    await transporter.sendMail({
      from: `"PrepPal" <${process.env.EMAIL_USER}>`,
      to,
      subject: "PrepPal Password Reset Token",
      html: resetMessage,
    });

    console.log("✅ Password reset token sent to", to);
  } catch (error) {
    console.error("❌ Password reset email not sent:", error);
    throw error;
  }
};

module.exports = {
  sendVerificationEmail,
  sendResetPasswordEmail,
};
