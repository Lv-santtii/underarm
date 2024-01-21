// Middleware que indica cuando hay una entrada a un Html de la app //
const authMiddleware = (req, res, next) => {
  if (req.url === '/' || req.url.endsWith('.html')) {
    console.log(`Nueva entrada a: ${req.url}`);
  }
  next(); 
};

module.exports = authMiddleware;