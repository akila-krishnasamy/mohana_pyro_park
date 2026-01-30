import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Protect routes - verify JWT token
export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User no longer exists'
      });
    }

    if (!req.user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'User account is deactivated'
      });
    }

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }
};

// Role-based authorization
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user.role}' is not authorized to access this route`
      });
    }
    next();
  };
};

// Check if user is staff or higher
export const isStaffOrHigher = (req, res, next) => {
  const staffRoles = ['staff', 'manager', 'owner'];
  if (!staffRoles.includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: 'Access restricted to staff members only'
    });
  }
  next();
};

// Check if user is manager or owner
export const isManagerOrOwner = (req, res, next) => {
  const managerRoles = ['manager', 'owner'];
  if (!managerRoles.includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: 'Access restricted to managers and owners only'
    });
  }
  next();
};

// Check if user is staff (any non-customer role)
export const isStaff = (req, res, next) => {
  const staffRoles = ['staff', 'manager', 'owner'];
  if (!staffRoles.includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: 'Access restricted to staff members only'
    });
  }
  next();
};

// Check if user is owner
export const isOwner = (req, res, next) => {
  if (req.user.role !== 'owner') {
    return res.status(403).json({
      success: false,
      message: 'Access restricted to owner only'
    });
  }
  next();
};
