import { validationResult } from "express-validator";

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages = [];
    errors.array().map((err) => {
      messages.push(err.msg);
    });

    return res.send({ success: false, errors: [messages.toString()] });
}
  next();
};

module.exports = { validateRequest };
