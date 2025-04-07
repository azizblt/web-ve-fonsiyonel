const errorHandler = (err, req, res, next) => {
    console.error(err.stack);

    // API Error response
    res.status(err.status || 500).json({
        error: {
            message: err.message || 'Bir hata oluştu!',
            code: err.code || 'INTERNAL_ERROR',
            ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
        }
    });
};

module.exports = errorHandler; 