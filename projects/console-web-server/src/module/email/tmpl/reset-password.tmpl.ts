import { env } from '../../../env';

export function getResetPasswordEmailTemplate(email: string, token: string): string {
  return `
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <title>DOGU</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  </head>

  <body style="margin: 0; padding: 0" bgcolor="#ffffff">
    <table
      id="parent"
      border="0"
      cellpadding="0"
      cellspacing="0"
      width="100%"
      style="font-family: Arial; margin: 0 auto 0 auto"
    >
      <tr>
        <td></td>
        <td
          width="700"
          align="center"
          style="background-size: 100%; background-repeat: no-repeat"
        >
          <table border="0" cellpadding="0" cellspacing="0" width="100%">
            <tr>
              <td
                align="center"
                style="padding: 40px 0 0 0; font-size: 24px; font-weight: 600"
              >
                DOGU
              </td>
            </tr>
            <tr>
              <td align="center" style="padding: 32px 0 0 0; font-size: 16px">
                Click button to reset your password.
              </td>
            </tr>
            <tr>
              <td align="center" style="padding: 24px 0 0 0">
                <a
                  href="${env.DOGU_CONSOLE_URL}/account/reset-password?email=${email}&token=${token}"
                  style="
                    display: inline-block;
                    width: 250px;
                    padding: 12px 0 12px 0;
                    background-color: #1890ff;
                    border-radius: 8px;
                    font-size: 16px;
                    font-weight: 400;
                    color: #ffffff;
                  "
                >
                  Reset password
                </a>
              </td>
            </tr>
          </table>
        </td>
        <td></td>
      </tr>
    </table>
  </body>
</html>
`;
}
