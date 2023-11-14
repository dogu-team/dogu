import { OrganizationBase, UserBase } from '@dogu-private/console';
import { env } from '../../../env';

export function getInvitationEmailTemplate(
  organization: OrganizationBase, //
  inviter: UserBase,
  email: string,
  token: string,
): string {
  return `
  <!DOCTYPE html>
  <html xmlns="http://www.w3.org/1999/xhtml">
  
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <title>DOGU</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  </head>
  
  <body style="margin: 0; padding: 0;" bgcolor="#ffffff">
    <table id="parent" border="0" cellpadding="0" cellspacing="0" width="100%"
      style="font-family: Arial; margin: 0 auto 0 auto;">
      <tr>
        <td></td>
        <td width="700" align="center"
          style="background-size: 100%; background-repeat: no-repeat;">
          <table border="0" cellpadding="0" cellspacing="0" width="100%">
            <tr>
              <td style="padding: 20px 20px 0 20px;">
                <table border="0" cellpadding="0" cellspacing="0" width="100%">
                  <tr>
                    <td>
                      <img src="https://s3.ap-northeast-2.amazonaws.com/public.dogutech.io/dogu/logo/dogu-horizontal.png" width="200" height="50" alt="Dogu Technologies"/>
                    </td>
                  </tr>
                  <tr>
                    <td align="center" style="padding: 40px 0 0 0; font-size: 24px; font-weight: 600;">
                    ${
                      organization.profileImageUrl
                        ? `<div style="border-radius: 6px; width: 48px; height: 48px; overflow: hidden"><img src="${organization.profileImageUrl}" style="width: 48px; height: 48px" alt="${organization.name}" /></div>`
                        : `<div style="width: 48px; text-align: center; background-color: #dcdcdc; border-radius: 6px; color: #000000; padding: 9px 0 9px 0; line-height: 30px; vertical-align: middle;">${organization.name[0].toUpperCase()}</div>`
                    }
                    </td>
                  </tr>
                  <tr>
                    <td align="center" style="padding: 40px 0 0 0; font-size: 24px; font-weight: 600;">${inviter.name} invited you to join organization ${organization.name}</td>
                  </tr>
                  <tr>
                    <td align="center" style="padding: 32px 0 0 0; font-size: 16px; line-height: 1.4;">
                      ${inviter.name} invited you to join organization ${organization.name} on Dogu.
                      <br />
                      This invitation will expire in 7 days.
                    </td>
                  </tr>
                  <tr>
                    <td align="center" style="padding: 24px 0 0 0;">
                      <a href="
                      ${env.DOGU_CONSOLE_URL}/signup/invite?token=${token}&email=${email}&organizationId=${organization.organizationId}
                      " style="
                        display: inline-block;
                        width: 250px;
                        padding: 12px 0 12px 0;
                        background-color: #1890ff;
                        border-radius: 8px;
                        font-size: 16px;
                      font-weight: 400;
                        color: #ffffff;
                      ">
                        Join ${organization.name}
                      </a>
                    </td>
                  </tr>
                  <tr>
                    <td align="center" style="padding: 32px 0 32px 0; font-size: 12px; line-height: 1.4;">
                      You're receiving this email because ${organization.name} invited you.
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="background-color: #f8f8f8; padding: 16px 20px 16px 20px;">
                <table border="0" cellpadding="0" cellspacing="0" width="100%">
                  <tr>
                    <td align="center">
                      <p style="font-size: 12px; margin: 0 0 0 0;">© 2023 Dogu Technologies Inc. All rights reserved</p>
                      <div style="font-size: 12px; color: #888888; margin: 8px 0 0 0;">
                        <a
                          style="font-size: 12px; color: #888888; text-decoration: none"
                          href="https://dogutech.io/notices/terms"
                          >Terms of Use</a
                        > | 
                        <a
                          style="font-size: 12px; color: #888888; text-decoration: none"
                          href="https://dogutech.io/notices/privacy"
                          >Privacy Policy</a
                        >
                      </div>
                    </td>
                  </tr>
                </table>
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
