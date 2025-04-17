const emailTemplate = (otp) => {
    return `
      <div style="background-color: #000; color: #FFD700; padding: 20px; font-family: Arial, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; border: 2px solid #FFD700; border-radius: 10px; padding: 20px;">
          <h1 style="text-align: center; color: #FFD700;">Welcome to Our Service!</h1>
          <p style="font-size: 16px;">Thank you for registering with us. Please verify your email address by entering the following OTP:</p>
          
          <div style="background-color: #FFD700; color: #000; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; margin: 20px 0; border-radius: 5px;">
            ${otp}
          </div>
          
          <p style="font-size: 14px; text-align: center;">This OTP is valid for 10 minutes.</p>
          
          <div style="margin-top: 30px; text-align: center;">
            <p style="font-size: 12px; color: #aaa;">If you didn't request this, please ignore this email.</p>
          </div>
        </div>
      </div>
    `;
  };
  
  module.exports = emailTemplate;