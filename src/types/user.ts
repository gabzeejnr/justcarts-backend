export interface User {
    name?: string,
    email?: string,
    password: string,
    confirmPassword?: string
}

export interface LoggedInUser {
    id: number,
    name: string,
    email: string
}