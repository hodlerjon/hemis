const mongoose = require('mongoose');

const validateObjectId = (paramName = 'id') => (req, res, next) => {
  const id = req.params[paramName];
  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400);
    throw new Error(`Invalid ID format for parameter: ${paramName}`);
  }
  next();
};

module.exports = validateObjectId;
