class ApiError extends Error {
  constructor(
    statusCode,
    message = "something went wrong",
    errors = [],
    stack = ""
  ) {
    super(message); // 🔹 parent Error class ko message dena zaroori hai

    this.statusCode = statusCode; // 🔹 jaise 404, 500, 401, etc.
    this.data = null;             // 🔹 extra data (agar chaahe to add kar sakta hai)
    this.message = message;       // 🔹 readable message
    this.success = false;         // 🔹 API success false, useful for frontend logic
    this.errors = errors;     


    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export {ApiError}