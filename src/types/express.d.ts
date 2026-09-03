declare global {
    namespace Express {
        interface Request {
            user?: {
                userId: number,
                purpose: string
            }
        }
    }
}

export {};