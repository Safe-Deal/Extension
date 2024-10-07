const API_KEY = process.env.AUTH_API_KEY;

export const apiAuth = () => (req, res, next) => {
  if (req.headers["api-key"] !== API_KEY) {
    res.status(403).send("Forbidden");
  } else {
    next();
  }
};
