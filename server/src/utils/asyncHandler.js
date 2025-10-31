const asyncHandler = (requestHandler) => {
    return (req, res, next) => {
        // ensure synchronous throws are caught by starting with a resolved promise
        Promise.resolve()
            .then(() => requestHandler(req, res, next))
            .catch((err) => next(err));
    };
};

// export { asyncHandler };
export default asyncHandler;

