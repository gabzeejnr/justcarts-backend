export function generateOtp(): string {
    const code = String(Math.floor((Math.random() * 900000) + 100000));
    return code;
}