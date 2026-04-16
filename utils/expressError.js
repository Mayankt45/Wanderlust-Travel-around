class ExpressError extends Error {
    constructor(statusCode, message) {
        super(); // calls parent Error class
        this.statusCode = statusCode;
        this.message = message;
    }
}

module.exports =ExpressError;