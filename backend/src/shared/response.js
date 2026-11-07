export const sendResponse = (res, statusCode, success, message, data = null) => {
  return res.status(statusCode).json({
    success,
    message,
    data
  });
};

export const sendError = (res, statusCode, message, errors = null) => {
  return res.status(statusCode).json({
    success: false,
    message,
    errors
  });
};

export const formatDecimal = (val) => {
  if (val === null || val === undefined) return '0.00';
  return Number(val).toFixed(2);
};
