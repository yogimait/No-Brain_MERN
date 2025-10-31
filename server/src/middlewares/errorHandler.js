import ApiError from "../utils/ApiError.js";

const errorHandler = (err, req, res, next) => {
  // If error is already an ApiError, use its status code and message
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.errors,
      data: err.data,
    });
  }

  // Handle mongoose validation errors
  if (err.name === "ValidationError") {
    const errors = Object.values(err.errors).map((error) => error.message);
    return res.status(400).json({
      success: false,
      message: "Validation Error",
      errors,
    });
  }

  // Handle mongoose duplicate key errors
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(409).json({
      success: false,
      message: `${field} already exists`,
    });
  }

  // Handle mongoose cast errors (invalid ObjectId, etc.)
  if (err.name === "CastError") {
    return res.status(400).json({
      success: false,
      message: "Invalid ID format",
    });
  }

  // Default error
  console.error("Error:", err);
  return res.status(500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
};

export default errorHandler;

