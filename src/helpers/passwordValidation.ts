export function checkStrength(password: string) {
    const isLongEnough = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[^A-Za-z0-9]/.test(password);

    if (!isLongEnough) return { error: "Password length is less than 8." }
    if (!hasUpperCase) return { error: "Password does not contain uppercase character." }
    if (!hasLowerCase) return { error: "Password does not contain lowercase character." }
    if (!hasNumber) return { error: "Password does not contain number." }
    if (!hasSpecial) return { error: "Password does not contain special character." }

    return {message: "Password Valid"}
};