/**
 * Custom error class for application-specific errors.
 * It extends the built-in Error class and includes an additional statusCode property
 * to represent the HTTP status code associated with the error.
 */
export class AppError extends Error {
    statusCode : number

    constructor(message : string, statusCode : number) {
        super(message)
        this.statusCode = statusCode
    }
}