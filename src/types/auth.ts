export interface RegisterUser {
    name: string,
    email: string,
    password: string,
    confirmPassword: string
}

export interface OtpToken {
    otp: string,
    regToken: string
}