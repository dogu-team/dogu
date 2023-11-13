export type PurchaseSuccessEmailTemplateParams = {
  planHistoryId: string;
  planName: string;
  optionName: string;
  months: number;
  purchaseDate: Date;
  amount: string;
  cardLast4Digits: string;
  cardName: string;
};

export const getPurcaseSuccessEmailTemplate = ({
  planHistoryId,
  planName,
  optionName,
  months,
  purchaseDate,
  amount,
  cardLast4Digits,
  cardName,
}: PurchaseSuccessEmailTemplateParams): string => {
  return `<!doctype html>
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
        <td width="700" align="center" style="background-size: 100%; background-repeat: no-repeat">
          <table border="0" cellpadding="0" cellspacing="0" width="100%">
            <tr>
              <td style="padding: 20px 20px 0 20px">
                <table border="0" cellpadding="0" cellspacing="0" width="100%">
                  <tr>
                    <td>
                      <img
                        src="https://s3.ap-northeast-2.amazonaws.com/public.dogutech.io/dogu/logo/dogu-horizontal.png"
                        width="200"
                        height="50"
                        alt="Dogu Technologies"
                      />
                    </td>
                  </tr>
                  <tr>
                    <td align="center" style="padding: 40px 0 0 0; font-size: 24px; font-weight: 600">
                      Dogu plan subscription has been processed successfully!
                    </td>
                  </tr>
                  <tr>
                    <td align="left" style="padding: 32px 0 32px 0; font-size: 16px; line-height: 1.4">
                      <div style="padding: 16px 16px 16px 16px; background-color: #f9f9f9;">
                        <p style="margin: 0 0 0 0; line-height: 1.5"><span>Purchase ID</span>: ${planHistoryId}</p>
                        <p style="margin: 0 0 0 0; line-height: 1.5"><span>Plan</span>: ${planName}</p>
                        <p style="margin: 0 0 0 0; line-height: 1.5"><span>Option</span>: ${optionName} / ${months} month${months > 1 ? 's' : ''}</p>

                        <div style="height: 2px; background-color: #cccccc; margin: 16px 0 16px 0;"></div>

                        <p style="margin: 0 0 0 0; line-height: 1.5"><span>Date</span>: ${purchaseDate.toUTCString()}</p>
                        <p style="margin: 0 0 0 0; line-height: 1.5"><span>Total</span>: ${amount}</p>
                        <p style="margin: 0 0 0 0; line-height: 1.5"><span>Payment</span>: <span style="vertical-align: sub;">**** **** ****</span> ${cardLast4Digits} (${cardName})</p>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td align="left">
                      <p style="margin: 0 0 0 0; line-height: 1.5; font-size: 16px">
                        If you have any questions, please contact us via <a href="mailto:contact@dogutech.io">email</a> or chat service on <a href="https://dogutech.io">our website</a>.
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td align="center" style="padding: 24px 0 32px 0">
                      <a
                        href="https://console.dogutech.io"
                        style="
                          display: inline-block;
                          width: 250px;
                          padding: 12px 0 12px 0;
                          background-color: #1890ff;
                          border-radius: 8px;
                          font-size: 16px;
                          font-weight: 400;
                          color: #ffffff;
                          text-decoration: none;
                        "
                      >
                        Move to Dogu
                      </a>
                    </td>
                  </tr>
                  <!-- <tr>
                    <td align="left" style="padding: 0 0 32px 0">
                      Once your email address has been verified, you will be able to access all of the features of Dogu.
                      <br />
                      <br />
                      If you did not sign up for an account, please disregard this email.
                    </td>
                  </tr> -->
                </table>
              </td>
            </tr>
            <tr>
              <td style="background-color: #f8f8f8; padding: 16px 20px 16px 20px">
                <table border="0" cellpadding="0" cellspacing="0" width="100%">
                  <tr>
                    <td align="center">
                      <p style="font-size: 12px; margin: 0 0 0 0">© 2023 Dogu Technologies Inc. All rights reserved</p>
                      <div style="font-size: 12px; color: #888888; margin: 8px 0 0 0">
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
};
