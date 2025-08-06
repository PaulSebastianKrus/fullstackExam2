import nodemailer from 'nodemailer';

async function sendWelcomeEmail() {
  try {
    
    const testAccount = await nodemailer.createTestAccount();
   
    const transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user, 
        pass: testAccount.pass, 
      },
    });

    
    const mailOptions = {
      from: '"Plant Recognizer" <paul.email@example.com>', 
      to: 'user@example.com', 
      subject: 'Welcome to Plant Recognizer!', 
      text: 'Welcome to Plant Recognizer! Start exploring plants today.',
      html: '<p>Welcome to <b>Plant Recognizer</b>! Start exploring plants today.</p>',
    };
    
  } catch (error) {
  }
}

export default sendWelcomeEmail;