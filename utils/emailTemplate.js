const generateVerificationEmail = (name, code) => {
  return `
    <div style="font-family: 'Inter', 'Segoe UI', Roboto, sans-serif; background-color: #f4f5f7; padding: 20px 20px; margin: 0;">
      <div style="max-width: 480px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.05); text-align: center; padding: 30px 30px;">
        
        <!-- Logo -->
        <div style="margin-bottom: 24px;">
          <img src="cid:logo@aura" alt="Aura Interiors Logo" width="96" style="display: block; margin: 0 auto 12px;">
        </div>

        <!-- Greeting -->
        <h1 style="font-size: 24px; font-weight: 700; color: #1f2937; margin: 0 0 12px; line-height: 1.3;">
          Hi ${name},
        </h1>
        
        <!-- Intro Text -->
        <p style="font-size: 16px; color: #4b5563; margin: 0 0 16px; line-height: 1.6;">
          Use the following verification code to secure your account. This code will expire in <strong>10 minutes</strong>.
        </p>

        <!-- Verification Code -->
        <div style="background-color: #fef2f2; border: 1px dashed #fecaca; border-radius: 12px; padding: 16px 0; margin: 0 auto 16px; max-width: 280px;">
          <span style="font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #B91C1C;">
            ${code}
          </span>
        </div>

        <!-- Secondary Text -->
        <p style="font-size: 14px; color: #6b7280; margin: 0 0 20px; line-height: 1.5;">
          If you didn’t request this code, you can safely ignore this email.
        </p>

        <!-- Footer -->
        <div style="border-top: 1px solid #f3f4f6; padding-top: 20px; font-size: 13px; color: #9ca3af; line-height: 1.5;">
          <p style="margin: 0 0 8px;">&copy; ${new Date().getFullYear()} Aura Interiors. All rights reserved.</p>
          <p style="margin: 0;">
            Need help? 
            <a href="mailto:dev.shahi.apps@gmail.com" style="color: #B91C1C; font-weight: 600; text-decoration: none;">dev.shahi.apps@gmail.com</a>
          </p>
        </div>

      </div>
    </div>
  `;
};

module.exports = { generateVerificationEmail };
