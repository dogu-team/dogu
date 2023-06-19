export interface ResetPasswordWithTokenDtoBase {
  email: string;
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export interface SendVerifyEmailDtoBase {
  email: string;
}

export interface VerifyEmailDtoBase {
  token: string;
  email: string;
}

export interface ValidationResetPasswordDtoBase {
  email: string;
  token: string;
}
