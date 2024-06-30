exports.sendJSON = (res, data, statusCode = 200) => {
  res.status(statusCode).json(data);
};
