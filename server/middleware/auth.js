




// // middleware/auth.js
// const jwt = require('jsonwebtoken');

// module.exports = function (req, res, next) {
//   const authHeader = req.headers['authorization']; // merr header me të gjitha me të vogla
//   const token = authHeader && authHeader.split(' ')[1]; // merr token pas "Bearer "

//   if (!token) {
//     return res.status(401).json({ error: 'No token, authorization denied' });
//   }

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     req.user = { id: decoded.userId };
//     next();
//   } catch (err) {
//     console.error('JWT verification failed:', err.message);
//     return res.status(401).json({ error: 'Token is not valid' });
//   }
// };


const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  const authHeader = req.headers['authorization']; // Merr header-in
  const token = authHeader && authHeader.split(' ')[1]; // Merr tokenin pas 'Bearer '

  if (!token) {
    return res.status(401).json({ error: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.id }; // <-- Këtu ndrysho nga decoded.userId në decoded.id
    next();
  } catch (err) {
    console.error('JWT verification failed:', err.message);
    return res.status(401).json({ error: 'Token is not valid' });
  }
};
