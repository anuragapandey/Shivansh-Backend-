export function notFoundHandler(req, res) {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` })
}

export function errorHandler(error, _req, res, _next) {
  const statusCode = error.statusCode || 500
  const payload = {
    message: error.message || 'Internal server error',
  }

  if (error.details) {
    payload.details = error.details
  }

  res.status(statusCode).json(payload)
}
