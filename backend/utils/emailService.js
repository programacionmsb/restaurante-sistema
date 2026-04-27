const nodemailer = require('nodemailer');

const crearTransporter = () => nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const enviarVerificacion = async (email, nombre, token) => {
  const transporter = crearTransporter();
  const link = `${process.env.BACKEND_URL}/api/app/verificar/${token}`;

  await transporter.sendMail({
    from: `"La Sabro-Zona" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Verifica tu cuenta en La Sabro-Zona',
    html: `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verificar Email - La Sabro-Zona</title>
</head>
<body style="margin:0;padding:0;background-color:#1a1a1a;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#1a1a1a;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#222222;border-radius:16px;overflow:hidden;max-width:600px;width:100%;">
          <tr>
            <td style="background:linear-gradient(135deg,#FF6B2C,#e8511a);padding:40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:32px;font-weight:800;letter-spacing:1px;">🍽️ La Sabro-Zona</h1>
              <p style="margin:8px 0 0;color:#ffe0d0;font-size:14px;letter-spacing:2px;text-transform:uppercase;">Restaurante</p>
            </td>
          </tr>
          <tr>
            <td style="padding:48px 40px 32px;">
              <h2 style="margin:0 0 16px;color:#FF6B2C;font-size:24px;">¡Hola, ${nombre}! 👋</h2>
              <p style="margin:0 0 24px;color:#cccccc;font-size:16px;line-height:1.6;">
                Gracias por registrarte en <strong style="color:#ffffff;">La Sabro-Zona</strong>. Estás a un paso de disfrutar de nuestro delicioso menú desde tu celular.
              </p>
              <p style="margin:0 0 32px;color:#cccccc;font-size:16px;line-height:1.6;">
                Por favor, verifica tu dirección de email haciendo clic en el botón de abajo:
              </p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="${link}" style="display:inline-block;background:linear-gradient(135deg,#FF6B2C,#e8511a);color:#ffffff;text-decoration:none;padding:16px 48px;border-radius:50px;font-size:16px;font-weight:700;letter-spacing:0.5px;box-shadow:0 4px 15px rgba(255,107,44,0.4);">
                      ✅ Verificar mi Email
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:0 40px 32px;">
              <div style="background-color:#2a2a2a;border-radius:8px;padding:20px;border-left:4px solid #FF6B2C;">
                <p style="margin:0 0 8px;color:#999999;font-size:13px;">Si el botón no funciona, copia y pega este enlace en tu navegador:</p>
                <p style="margin:0;word-break:break-all;">
                  <a href="${link}" style="color:#FF6B2C;font-size:13px;text-decoration:none;">${link}</a>
                </p>
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding:0 40px 40px;">
              <p style="margin:0;color:#666666;font-size:13px;line-height:1.6;">
                Este enlace expirará en <strong style="color:#999999;">24 horas</strong>. Si no creaste esta cuenta, puedes ignorar este mensaje.
              </p>
            </td>
          </tr>
          <tr>
            <td style="background-color:#1a1a1a;padding:24px 40px;text-align:center;border-top:1px solid #333333;">
              <p style="margin:0;color:#555555;font-size:12px;">© 2024 La Sabro-Zona. Todos los derechos reservados.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
  });
};

const enviarBienvenida = async (email, nombre) => {
  const transporter = crearTransporter();

  await transporter.sendMail({
    from: `"La Sabro-Zona" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: '¡Bienvenido a La Sabro-Zona! 🎉',
    html: `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bienvenido - La Sabro-Zona</title>
</head>
<body style="margin:0;padding:0;background-color:#1a1a1a;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#1a1a1a;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#222222;border-radius:16px;overflow:hidden;max-width:600px;width:100%;">
          <tr>
            <td style="background:linear-gradient(135deg,#FF6B2C,#e8511a);padding:40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:32px;font-weight:800;letter-spacing:1px;">🍽️ La Sabro-Zona</h1>
              <p style="margin:8px 0 0;color:#ffe0d0;font-size:14px;letter-spacing:2px;text-transform:uppercase;">Restaurante</p>
            </td>
          </tr>
          <tr>
            <td style="padding:48px 40px 40px;text-align:center;">
              <div style="font-size:64px;margin-bottom:16px;">🎉</div>
              <h2 style="margin:0 0 16px;color:#FF6B2C;font-size:28px;">¡Bienvenido, ${nombre}!</h2>
              <p style="margin:0 0 24px;color:#cccccc;font-size:16px;line-height:1.6;">
                Tu cuenta ha sido verificada exitosamente. Ya puedes iniciar sesión en la app de <strong style="color:#ffffff;">La Sabro-Zona</strong> y disfrutar de nuestro menú.
              </p>
              <p style="margin:0;color:#cccccc;font-size:16px;line-height:1.6;">
                ¡Esperamos verte pronto! 🍛
              </p>
            </td>
          </tr>
          <tr>
            <td style="background-color:#1a1a1a;padding:24px 40px;text-align:center;border-top:1px solid #333333;">
              <p style="margin:0;color:#555555;font-size:12px;">© 2024 La Sabro-Zona. Todos los derechos reservados.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
  });
};

module.exports = { enviarVerificacion, enviarBienvenida };
