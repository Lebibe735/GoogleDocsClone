// // // // const jwt = require('jsonwebtoken');
// // // // const JWT_SECRET = process.env.JWT_SECRET || 'yoursecret';

// // // // function authMiddleware(req, res, next) {
// // // //   const token = req.headers.authorization?.split(' ')[1];
// // // //   if (!token) return res.status(401).json({ error: 'No token' });

// // // //   try {
// // // //     const decoded = jwt.verify(token, JWT_SECRET);
// // // //     req.user = decoded;
// // // //     next();
// // // //   } catch (err) {
// // // //     res.status(401).json({ error: 'Invalid token' });
// // // //   }
// // // // }

// // // // middleware/authenticateUser.js
// // // const jwt = require('jsonwebtoken');
// // // const User = require('../models/User');

// // // module.exports = async function authenticateUser(req, res, next) {
// // //   try {
// // //     const authHeader = req.headers.authorization;
// // //     if (!authHeader) return res.status(401).json({ error: "No token provided" });

// // //     const token = authHeader.split(' ')[1];
// // //     if (!token) return res.status(401).json({ error: "Invalid token format" });

// // //     const decoded = jwt.verify(token, process.env.JWT_SECRET);
// // //     const user = await User.findById(decoded.id);
// // //     if (!user) return res.status(401).json({ error: "User not found" });

// // //     req.user = { id: user._id };
// // //     next();
// // //   } catch (err) {
// // //     return res.status(401).json({ error: "Authentication failed" });
// // //   }
// // // };
// // // middleware/auth.js
// // const jwt = require('jsonwebtoken');

// // module.exports = function (req, res, next) {
// //   const token = req.header('Authorization')?.split(' ')[1]; // "Bearer <token>"

// //   if (!token) return res.status(401).json({ error: 'No token, authorization denied' });

// //   try {
// //     const decoded = jwt.verify(token, process.env.JWT_SECRET);
// //     req.user = { id: decoded.userId }; // <-- This is critical
// //     next();
// //   } catch (err) {
// //     res.status(401).json({ error: 'Token is not valid' });
// //   }
// // };
// const jwt = require('jsonwebtoken');

// module.exports = function (req, res, next) {
//   const token = req.header('Authorization')?.split(' ')[1];

//   if (!token) return res.status(401).json({ error: 'No token, authorization denied' });

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     req.user = { id: decoded.userId };
//     next();
//   } catch (err) {
//     res.status(401).json({ error: 'Token is not valid' });
//   }
// };









// middleware/auth.js
const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  const authHeader = req.headers['authorization']; // merr header me të gjitha me të vogla
  const token = authHeader && authHeader.split(' ')[1]; // merr token pas "Bearer "

  if (!token) {
    return res.status(401).json({ error: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.userId };
    next();
  } catch (err) {
    console.error('JWT verification failed:', err.message);
    return res.status(401).json({ error: 'Token is not valid' });
  }
};
