import nodemailer, { type Transporter } from 'nodemailer';
import type { User } from './seedData.ts';

// Configurable environment variables for SMTP service
const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587;
const SMTP_SECURE = process.env.SMTP_SECURE === 'true' || SMTP_PORT === 465;
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const SMTP_FROM = process.env.SMTP_FROM || '"FDelivery Security" <security@fdelivery.com>';

let cachedTransporter: Transporter | null = null;

/**
 * Returns a nodemailer Transporter using configured environment credentials,
 * or an Ethereal test transporter for seamless local testing.
 */
async function getTransporter(): Promise<Transporter | null> {
  if (cachedTransporter) {
    return cachedTransporter;
  }

  // 1. If explicit SMTP credentials are provided in environment variables
  if (SMTP_HOST && SMTP_USER && SMTP_PASS) {
    cachedTransporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_SECURE,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
    console.log(`[Email Service] Configured live SMTP transport with host: ${SMTP_HOST}:${SMTP_PORT}`);
    return cachedTransporter;
  }

  // 2. Fallback for testing / development if no SMTP credentials are provided
  try {
    const testAccount = await nodemailer.createTestAccount();
    cachedTransporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    console.log('[Email Service] Configured Ethereal testing transport (set SMTP_HOST, SMTP_USER, SMTP_PASS in .env for production)');
    return cachedTransporter;
  } catch (err: any) {
    console.warn('[Email Service] Could not initialize test email transporter:', err?.message);
    return null;
  }
}

export interface LoginEmailDetails {
  loginDate: string;
  loginTime: string;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Sends a security login notification email to the user.
 * Handled gracefully so that failures NEVER crash or block the authentication flow.
 */
export async function sendLoginNotificationEmail(
  user: User,
  details?: { ip?: string; userAgent?: string; timestamp?: Date }
): Promise<{ success: boolean; previewUrl?: string | false; error?: string }> {
  try {
    const transporter = await getTransporter();
    if (!transporter) {
      console.warn('[Email Service] No email transporter available. Skipping notification.');
      return { success: false, error: 'No transporter configured' };
    }

    const now = details?.timestamp || new Date();
    const loginDate = now.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    const loginTime = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZoneName: 'short',
    });

    const clientIp = details?.ip || 'Direct session';
    const clientDevice = details?.userAgent || 'Web Browser';

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Successful Login Notification</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b; }
    .card { max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; }
    .header { background: #f94a3d; color: #ffffff; padding: 28px 32px; text-align: center; }
    .header h1 { margin: 0; font-size: 22px; font-weight: 700; letter-spacing: -0.5px; }
    .content { padding: 32px; }
    .greeting { font-size: 17px; font-weight: 600; color: #0f172a; margin-bottom: 12px; }
    .info-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px 20px; margin: 20px 0; }
    .info-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 14px; }
    .info-label { color: #64748b; font-weight: 500; }
    .info-val { color: #0f172a; font-weight: 600; text-align: right; }
    .notice { font-size: 13px; color: #64748b; line-height: 1.6; margin-top: 24px; border-top: 1px solid #f1f5f9; padding-top: 18px; }
    .footer { text-align: center; font-size: 12px; color: #94a3b8; padding: 20px 32px; background: #f8fafc; border-top: 1px solid #e2e8f0; }
    .badge-success { display: inline-block; background: #dcfce7; color: #15803d; font-size: 12px; font-weight: 700; padding: 4px 10px; border-radius: 20px; margin-bottom: 16px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <h1>FDelivery Account Security</h1>
    </div>
    <div class="content">
      <span class="badge-success">&#10003; Login Confirmed</span>
      <div class="greeting">Hello, ${user.full_name}!</div>
      <p style="margin: 0 0 16px 0; color: #475569; font-size: 15px; line-height: 1.5;">
        This email confirms that your FDelivery account was successfully accessed.
      </p>

      <div class="info-box">
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <tr>
            <td style="padding: 6px 0; color: #64748b;"><strong>User Name:</strong></td>
            <td style="padding: 6px 0; color: #0f172a; text-align: right;"><strong>${user.full_name}</strong></td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b;"><strong>Account Email:</strong></td>
            <td style="padding: 6px 0; color: #0f172a; text-align: right;">${user.email}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b;"><strong>Login Date:</strong></td>
            <td style="padding: 6px 0; color: #0f172a; text-align: right;">${loginDate}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b;"><strong>Login Time:</strong></td>
            <td style="padding: 6px 0; color: #0f172a; text-align: right;">${loginTime}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b;"><strong>IP Address:</strong></td>
            <td style="padding: 6px 0; color: #0f172a; text-align: right;">${clientIp}</td>
          </tr>
        </table>
      </div>

      <div class="notice">
        <strong>Was this you?</strong> If you recently logged in to your FDelivery account, you can safely ignore this message. If you did not log in, please secure your account immediately by resetting your password.
      </div>
    </div>
    <div class="footer">
      &copy; ${now.getFullYear()} FDelivery &bull; All rights reserved.
    </div>
  </div>
</body>
</html>
    `;

    const textContent = `
FDelivery Security Alert: Successful Login

Hello ${user.full_name},

Your FDelivery account (${user.email}) was successfully accessed.

Login Details:
- Name: ${user.full_name}
- Date: ${loginDate}
- Time: ${loginTime}
- IP Address: ${clientIp}
- Device: ${clientDevice}

If this was you, you can safely disregard this email. If you did not initiate this login, please secure your account immediately.
    `.trim();

    const info = await transporter.sendMail({
      from: SMTP_FROM,
      to: `"${user.full_name}" <${user.email}>`,
      subject: `Successful Login Notice - FDelivery Account (${loginTime})`,
      text: textContent,
      html: htmlContent,
    });

    const previewUrl = nodemailer.getTestMessageUrl(info);
    console.log(`[Email Service] Login notification email sent to ${user.email} (Message ID: ${info.messageId})`);
    if (previewUrl) {
      console.log(`[Email Service] Test email preview URL: ${previewUrl}`);
    }

    return {
      success: true,
      previewUrl: previewUrl || undefined,
    };
  } catch (err: any) {
    // Graceful error handling - never crash login
    console.error('[Email Service] Failed to send login notification email:', err?.message || err);
    return {
      success: false,
      error: err?.message || 'Email delivery failed',
    };
  }
}
