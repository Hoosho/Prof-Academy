import nodemailer from 'nodemailer';

export const sendEmail = async (to, subject, otp) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  const otpDigits = otp.toString().split('');

  const htmlTemplate = `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="ar" dir="rtl">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
</head>
<body style="margin: 0; padding: 0; background-color: #0f172a; font-family: 'Tahoma', 'Arial', sans-serif;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%" bgcolor="#0f172a" dir="rtl">
    <tr>
      <td align="center" style="padding: 20px 0;">
        
        <table border="0" cellpadding="0" cellspacing="0" width="380" style="max-width: 92%; background-color: #1e293b; border-radius: 24px; border: 1px solid #334155;">
          
          <tr>
            <td align="center" style="padding: 40px 0 20px 0;">
              <img src="https://i.ibb.co/FbTkRTVk/logo.png" alt="Prof Academy Logo" width="85" height="85" style="display: block; border-radius: 50%;" />
            </td>
          </tr>

          <tr>
            <td align="center" style="padding: 0 20px 10px 20px;">
              <h1 style="color: #ffffff; font-size: 24px; margin: 0; font-weight: bold;">رمز التحقق</h1>
            </td>
          </tr>

          <tr>
            <td align="center" style="padding: 10px 30px 25px 30px;">
              <p style="color: #94a3b8; font-size: 15px; line-height: 1.6; margin: 0;">
                أهلاً بك في <b>Prof Academy</b><br/>
                استخدم الرمز التالي لتأمين عملية تسجيل الدخول:
              </p>
            </td>
          </tr>

          <tr>
            <td align="center" style="padding: 0 0 30px 0;" dir="ltr">
              <table border="0" cellpadding="0" cellspacing="0" align="center">
                <tr>
                  <td style="white-space: nowrap;">
                    ${otpDigits.map(d => `
                      <div style="display: inline-block; width: 38px; height: 48px; line-height: 48px; margin: 0 3px; border: 1px solid #475569; border-radius: 12px; color: #38bdf8; font-size: 22px; font-weight: bold; background-color: #0f172a; text-align: center;">
                        ${d}
                      </div>
                    `).join('')}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td align="center" style="padding: 0 25px 35px 25px;">
              <table border="0" cellpadding="0" cellspacing="0" width="100%" bgcolor="#7f1d1d" style="border-radius: 14px;">
                <tr>
                  <td align="center" style="padding: 14px 10px; color: #fecaca; font-size: 13px; font-weight: bold;">
                    ⚠️ هذا الكود صالح لمدة 15 دقيقة فقط
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td align="center" style="padding: 0 30px 40px 30px; color: #64748b; font-size: 12px; line-height: 1.8; border-top: 1px solid #334155; padding-top: 20px;">
              إذا لم تطلب هذا الرمز، يرجى تجاهل هذا الإيميل.<br/>
              <span style="color: #475569;">Prof Academy © 2025</span>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>
</body>
</html>
  `;

  await transporter.sendMail({
    from: `"Prof Academy" <${process.env.SMTP_USER}>`,
    to,
    subject,
    text: `رمز التحقق الخاص بك هو: ${otp}`,
    html: htmlTemplate
  });
};