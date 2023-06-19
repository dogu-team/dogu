export interface SubscribeNewsletterDtoBase {
  email: string;
  captcha: string;
}

export interface UnsubscribeNewsletterDtoBase {
  email: string;
  token: string;
}
