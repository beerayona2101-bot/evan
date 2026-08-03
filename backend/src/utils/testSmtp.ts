import dotenv from 'dotenv';
import path from 'path';
import nodemailer from 'nodemailer';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function verifySmtp() {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = Number(process.env.SMTP_PORT) || 587;
  const user = process.env.SMTP_USER;
  const pass = (process.env.SMTP_PASS || '').replace(/\s+/g, ''); // strip spaces from App Password

  console.log(`[SMTP Verification] Testing connection to ${host}:${port}`);
  console.log(`[SMTP Verification] User: ${user}`);
  console.log(`[SMTP Verification] Pass length: ${pass.length} chars`);

  if (!user || user === 'your-email@gmail.com') {
    console.error('❌ ERROR: SMTP_USER is still set to placeholder "your-email@gmail.com". Please put your real Gmail address in backend/.env!');
    process.exit(1);
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
    tls: { rejectUnauthorized: false }
  });

  try {
    await transporter.verify();
    console.log('✅ SUCCESS! Nodemailer SMTP connection verified successfully!');
  } catch (error) {
    console.error('❌ SMTP Connection Failed:', (error as Error).message);
  }
}

verifySmtp();
