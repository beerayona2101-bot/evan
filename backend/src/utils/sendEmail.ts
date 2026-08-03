import nodemailer from 'nodemailer';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

// Create Nodemailer Transporter using Gmail SMTP (MAIL_USER & MAIL_PASS from .env)
export const createTransporter = () => {
  const mailUser = process.env.MAIL_USER || process.env.SMTP_USER || 'beerayona2101@gmail.com';
  const rawPass = process.env.MAIL_PASS || process.env.SMTP_PASS || '';
  const cleanPass = rawPass.replace(/\s+/g, '');

  const isConfigured = mailUser && cleanPass;

  if (!isConfigured) {
    console.log('[Nodemailer] Gmail SMTP credentials (MAIL_USER / MAIL_PASS) not detected in environment. Running in fallback dry-run mode.');
  }

  return nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: mailUser,
      pass: cleanPass || 'dummy-app-password',
    },
    tls: {
      rejectUnauthorized: false,
    },
  });
};

// Generic Send Email Function
export const sendEmail = async (options: EmailOptions): Promise<boolean> => {
  try {
    const transporter = createTransporter();
    const mailUser = process.env.MAIL_USER || process.env.SMTP_USER || 'beerayona2101@gmail.com';
    const from = process.env.EMAIL_FROM || `"EVAN COLLECTIONS" <${mailUser}>`;

    const info = await transporter.sendMail({
      from,
      to: options.to,
      subject: options.subject,
      text: options.text || options.html.replace(/<[^>]*>?/gm, ''),
      html: options.html,
    });

    console.log(`[Nodemailer] Email dispatched successfully to ${options.to}. MessageId: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error('[Nodemailer Error] Failed to send email:', (error as Error).message);
    return false;
  }
};

// Common Email Header & Footer Wrappers
const getEmailHeader = (title: string, subtitle: string = 'ROYAL HANDLOOM SAREE ATELIER') => `
  <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #fffdf9; border: 1px solid #fde68a; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05);">
    <div style="background: linear-gradient(135deg, #7f1d1d, #450a0a); padding: 30px; text-align: center; border-bottom: 3px solid #f59e0b;">
      <h1 style="color: #fef3c7; margin: 0; font-size: 26px; letter-spacing: 2px; text-transform: uppercase; font-weight: 900;">EVAN COLLECTIONS</h1>
      <p style="color: #fcd34d; margin: 5px 0 0 0; font-size: 11px; letter-spacing: 3px; text-transform: uppercase;">${subtitle}</p>
    </div>
`;

const getEmailFooter = () => `
    <div style="background-color: #0f172a; padding: 24px; text-align: center; color: #94a3b8; font-size: 11px; border-top: 2px solid #b45309;">
      <p style="margin: 0 0 8px 0; color: #fcd34d; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">EVAN COLLECTIONS • CONCIERGE CARE</p>
      <p style="margin: 0 0 12px 0;">Need assistance? Contact our Saree Specialists at <a href="mailto:support@evancollections.com" style="color: #fef3c7; text-decoration: underline;">support@evancollections.com</a> | +91 94906 44434</p>
      <div style="margin: 12px 0;">
        <a href="https://instagram.com" style="color: #fcd34d; text-decoration: none; margin: 0 8px;">Instagram</a> •
        <a href="https://facebook.com" style="color: #fcd34d; text-decoration: none; margin: 0 8px;">Facebook</a> •
        <a href="https://pinterest.com" style="color: #fcd34d; text-decoration: none; margin: 0 8px;">Pinterest</a>
      </div>
      <p style="margin: 8px 0 0 0; font-size: 10px; color: #64748b;">© 2026 EVAN COLLECTIONS. All Rights Reserved. Pure Silk Mark Certified Handlooms.</p>
    </div>
  </div>
`;

// ========================================================
// 13 PRODUCTION BRANDED HTML EMAIL TEMPLATES
// ========================================================

/** 1. Welcome Email */
export const sendWelcomeEmail = async (recipientEmail: string, userName: string) => {
  const html = `
    ${getEmailHeader('WELCOME TO EVAN COLLECTIONS')}
    <div style="padding: 30px;">
      <h2 style="color: #0f172a; font-size: 20px; margin-top: 0;">Namaste ${userName},</h2>
      <p style="color: #475569; font-size: 14px; line-height: 1.6;">
        Welcome to <strong>EVAN COLLECTIONS</strong>. Your account has been registered successfully. As a valued member of our luxury atelier, you enjoy priority access to certified handloom launches, Silk Mark pure sarees, and complimentary express shipping.
      </p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/shop" style="display: inline-block; background: linear-gradient(135deg, #7f1d1d, #991b1b); color: #fef3c7; font-weight: 800; text-decoration: none; padding: 14px 32px; border-radius: 12px; text-transform: uppercase; font-size: 12px; letter-spacing: 1px; border: 1px solid #f59e0b;">
          EXPLORE HERITAGE CATALOG
        </a>
      </div>
    </div>
    ${getEmailFooter()}
  `;
  return sendEmail({ to: recipientEmail, subject: `👑 Welcome to EVAN COLLECTIONS, ${userName}!`, html });
};

/** 2. Email Verification */
export const sendEmailVerificationEmail = async (recipientEmail: string, userName: string, token: string) => {
  const verifyUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/verify-email?token=${token}`;
  const html = `
    ${getEmailHeader('VERIFY YOUR EVAN ACCOUNT')}
    <div style="padding: 30px;">
      <h2 style="color: #0f172a; font-size: 18px; margin-top: 0;">Verify Your Email Address</h2>
      <p style="color: #475569; font-size: 14px; line-height: 1.6;">
        Hello ${userName}, please click the button below to verify your email address and activate your EVAN account priviliges. This link will expire in 24 hours.
      </p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${verifyUrl}" style="display: inline-block; background-color: #7f1d1d; color: #fef3c7; font-weight: bold; text-decoration: none; padding: 14px 30px; border-radius: 12px; text-transform: uppercase; font-size: 12px; border: 1px solid #f59e0b;">
          VERIFY EMAIL ADDRESS
        </a>
      </div>
      <p style="color: #94a3b8; font-size: 11px; word-break: break-all;">Or copy and paste this link in your browser: ${verifyUrl}</p>
    </div>
    ${getEmailFooter()}
  `;
  return sendEmail({ to: recipientEmail, subject: `🔒 Verify Your Email — EVAN COLLECTIONS`, html });
};

/** 3. Forgot Password Email */
export const sendForgotPasswordEmail = async (recipientEmail: string, userName: string, token: string) => {
  const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password?token=${token}`;
  
  console.log(`\n========================================================`);
  console.log(`🔑 [EVAN SECURITY] PASSWORD RESET LINK GENERATED:`);
  console.log(`👤 User: ${userName} (${recipientEmail})`);
  console.log(`🔗 Reset URL: ${resetUrl}`);
  console.log(`========================================================\n`);

  const html = `
    ${getEmailHeader('PASSWORD RESET REQUEST')}
    <div style="padding: 30px;">
      <h2 style="color: #0f172a; font-size: 18px; margin-top: 0;">Reset Your Password</h2>
      <p style="color: #475569; font-size: 14px; line-height: 1.6;">
        Hello ${userName}, we received a request to reset your password. Click below to choose a new password. This link is valid for 15 minutes.
      </p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" style="display: inline-block; background-color: #991b1b; color: #fef3c7; font-weight: bold; text-decoration: none; padding: 14px 30px; border-radius: 12px; text-transform: uppercase; font-size: 12px; border: 1px solid #f59e0b;">
          RESET MY PASSWORD
        </a>
      </div>
      <p style="color: #94a3b8; font-size: 11px; word-break: break-all;">If you did not request this reset, please ignore this email.</p>
    </div>
    ${getEmailFooter()}
  `;
  return sendEmail({ to: recipientEmail, subject: `🔑 Password Reset Link — EVAN COLLECTIONS`, html });
};

/** 4. Password Changed Notification */
export const sendPasswordChangedEmail = async (recipientEmail: string, userName: string) => {
  const html = `
    ${getEmailHeader('SECURITY ALERT')}
    <div style="padding: 30px;">
      <h2 style="color: #0f172a; font-size: 18px; margin-top: 0;">Password Changed Successfully</h2>
      <p style="color: #475569; font-size: 14px; line-height: 1.6;">
        Hello ${userName}, your EVAN account password was updated successfully. If you did not make this change, please contact our support team immediately.
      </p>
    </div>
    ${getEmailFooter()}
  `;
  return sendEmail({ to: recipientEmail, subject: `🛡️ Security Notice: Password Changed — EVAN COLLECTIONS`, html });
};

/** 5. Account Created Notification */
export const sendAccountCreatedEmail = async (recipientEmail: string, userName: string) => {
  return sendWelcomeEmail(recipientEmail, userName);
};

/** 6. Order Confirmation & Invoice */
export const sendOrderConfirmationEmail = async (order: any, recipientEmail: string) => {
  const itemsHtml = (order.orderItems || [])
    .map((item: any) => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #fef3c7; font-size: 13px; font-weight: bold; color: #0f172a;">${item.name}</td>
        <td style="padding: 10px; border-bottom: 1px solid #fef3c7; font-size: 12px; text-align: center;">${item.qty}</td>
        <td style="padding: 10px; border-bottom: 1px solid #fef3c7; font-size: 13px; font-weight: bold; text-align: right; color: #7f1d1d;">₹${((item.price || 0) * (item.qty || 1)).toLocaleString('en-IN')}</td>
      </tr>
    `).join('');

  const html = `
    ${getEmailHeader('ORDER CONFIRMATION & INVOICE')}
    <div style="padding: 30px;">
      <h2 style="color: #0f172a; font-size: 18px; margin-top: 0;">Thank You For Your Order!</h2>
      <p style="color: #475569; font-size: 14px;">Order Number: <strong style="color: #7f1d1d;">#${order._id}</strong></p>
      
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0; background: #fffbe8; border: 1px solid #fde68a; border-radius: 12px;">
        <thead>
          <tr style="border-bottom: 2px solid #f59e0b; color: #7f1d1d; font-size: 12px; text-align: left;">
            <th style="padding: 10px;">Item</th>
            <th style="padding: 10px; text-align: center;">Qty</th>
            <th style="padding: 10px; text-align: right;">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>

      <div style="text-align: right; padding-top: 10px; border-top: 2px solid #f59e0b;">
        <p style="margin: 4px 0; font-size: 16px; font-weight: 900; color: #7f1d1d;">Total Amount Paid: ₹${(order.totalPrice || 0).toLocaleString('en-IN')}</p>
      </div>
    </div>
    ${getEmailFooter()}
  `;
  return sendEmail({ to: recipientEmail, subject: `👑 Order Confirmation #${order._id} — EVAN COLLECTIONS`, html });
};

/** 7. Payment Success Receipt */
export const sendPaymentSuccessEmail = async (order: any, recipientEmail: string) => {
  const html = `
    ${getEmailHeader('PAYMENT RECEIPT')}
    <div style="padding: 30px;">
      <h2 style="color: #059669; font-size: 18px; margin-top: 0;">Payment Successful</h2>
      <p style="color: #475569; font-size: 14px;">We have successfully received your payment of <strong style="color: #7f1d1d;">₹${(order.totalPrice || 0).toLocaleString('en-IN')}</strong> for Order #${order._id}.</p>
    </div>
    ${getEmailFooter()}
  `;
  return sendEmail({ to: recipientEmail, subject: `💳 Payment Receipt for Order #${order._id} — EVAN COLLECTIONS`, html });
};

/** 8. Order Shipped Email */
export const sendOrderShippedEmail = async (order: any, recipientEmail: string) => {
  const html = `
    ${getEmailHeader('ORDER SHIPPED')}
    <div style="padding: 30px; text-align: center;">
      <h2 style="color: #7c3aed; font-size: 18px; margin-top: 0;">Your Saree Has Been Dispatched!</h2>
      <p style="color: #475569; font-size: 14px;">Order #${order._id} is on its way to you.</p>
      ${order.trackingNumber ? `<p style="font-size: 14px; font-weight: bold; color: #7f1d1d;">Tracking Number: ${order.trackingNumber}</p>` : ''}
    </div>
    ${getEmailFooter()}
  `;
  return sendEmail({ to: recipientEmail, subject: `🚚 Shipment Dispatched: Order #${order._id} — EVAN COLLECTIONS`, html });
};

/** 9. Out For Delivery Notification */
export const sendOutForDeliveryEmail = async (order: any, recipientEmail: string) => {
  const html = `
    ${getEmailHeader('OUT FOR DELIVERY')}
    <div style="padding: 30px; text-align: center;">
      <h2 style="color: #e11d48; font-size: 18px; margin-top: 0;">Out For Delivery Today!</h2>
      <p style="color: #475569; font-size: 14px;">Your order #${order._id} will be delivered to your address today by our express delivery executive.</p>
    </div>
    ${getEmailFooter()}
  `;
  return sendEmail({ to: recipientEmail, subject: `📦 Out For Delivery Today: Order #${order._id} — EVAN COLLECTIONS`, html });
};

/** 10. Order Delivered Email */
export const sendOrderDeliveredEmail = async (order: any, recipientEmail: string) => {
  const html = `
    ${getEmailHeader('ORDER DELIVERED')}
    <div style="padding: 30px; text-align: center;">
      <h2 style="color: #059669; font-size: 18px; margin-top: 0;">Delivered Successfully!</h2>
      <p style="color: #475569; font-size: 14px;">Your order #${order._id} has been delivered. We hope you adore your luxury handloom saree!</p>
    </div>
    ${getEmailFooter()}
  `;
  return sendEmail({ to: recipientEmail, subject: `🎉 Order Delivered: #${order._id} — EVAN COLLECTIONS`, html });
};

/** 11. Order Cancelled Email */
export const sendOrderCancelledEmail = async (order: any, recipientEmail: string) => {
  const html = `
    ${getEmailHeader('ORDER CANCELLED')}
    <div style="padding: 30px;">
      <h2 style="color: #dc2626; font-size: 18px; margin-top: 0;">Order Cancellation Notice</h2>
      <p style="color: #475569; font-size: 14px;">Order #${order._id} has been cancelled as requested.</p>
    </div>
    ${getEmailFooter()}
  `;
  return sendEmail({ to: recipientEmail, subject: `❌ Order Cancelled: #${order._id} — EVAN COLLECTIONS`, html });
};

/** 12. Refund Initiated Email */
export const sendRefundInitiatedEmail = async (order: any, recipientEmail: string, amount: number) => {
  const html = `
    ${getEmailHeader('REFUND INITIATED')}
    <div style="padding: 30px;">
      <h2 style="color: #d97706; font-size: 18px; margin-top: 0;">Refund Initiated</h2>
      <p style="color: #475569; font-size: 14px;">A refund of <strong style="color: #7f1d1d;">₹${amount.toLocaleString('en-IN')}</strong> for Order #${order._id} has been initiated.</p>
    </div>
    ${getEmailFooter()}
  `;
  return sendEmail({ to: recipientEmail, subject: `💸 Refund Initiated for Order #${order._id} — EVAN COLLECTIONS`, html });
};

/** 13. Refund Completed Email */
export const sendRefundCompletedEmail = async (order: any, recipientEmail: string, amount: number) => {
  const html = `
    ${getEmailHeader('REFUND PROCESSED')}
    <div style="padding: 30px;">
      <h2 style="color: #059669; font-size: 18px; margin-top: 0;">Refund Credited</h2>
      <p style="color: #475569; font-size: 14px;">Your refund of <strong style="color: #7f1d1d;">₹${amount.toLocaleString('en-IN')}</strong> for Order #${order._id} has been successfully credited to your payment method.</p>
    </div>
    ${getEmailFooter()}
  `;
  return sendEmail({ to: recipientEmail, subject: `✅ Refund Completed for Order #${order._id} — EVAN COLLECTIONS`, html });
};

export const sendOrderStatusUpdateEmail = sendOrderShippedEmail;
