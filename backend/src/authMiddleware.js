import jwt from 'jsonwebtoken';
import { User, Audit } from '../models/index.js';

// Middleware de autenticação
export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        error: 'Token de acesso requerido'
      });
    }

    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'mentor-ai-secret-key');
    
    // Buscar usuário
    const user = await User.findById(decoded.userId).select('-password');
    if (!user || !user.isActive) {
      await Audit.log({
        action: 'security_violation',
        details: { 
          reason: 'invalid_user_token',
          userId: decoded.userId 
        },
        metadata: {
          ipAddress: req.ip,
          userAgent: req.get('User-Agent'),
          endpoint: req.originalUrl
        },
        severity: 'warning',
        success: false
      });

      return res.status(401).json({
        error: 'Token inválido'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      await Audit.log({
        action: 'security_violation',
        details: { 
          reason: 'invalid_jwt_token',
          error: error.message 
        },
        metadata: {
          ipAddress: req.ip,
          userAgent: req.get('User-Agent'),
          endpoint: req.originalUrl
        },
        severity: 'warning',
        success: false
      });

      return res.status(401).json({
        error: 'Token inválido'
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Token expirado'
      });
    }

    console.error('Erro na autenticação:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
};

// Middleware opcional de autenticação (não rejeita se não houver token)
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'mentor-ai-secret-key');
      const user = await User.findById(decoded.userId).select('-password');
      
      if (user && user.isActive) {
        req.user = user;
      }
    }

    next();
  } catch (error) {
    // Em caso de erro, continua sem usuário autenticado
    next();
  }
};

// Middleware para verificar plano premium
export const requirePremium = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      error: 'Autenticação necessária'
    });
  }

  if (!req.user.isPremium()) {
    return res.status(403).json({
      error: 'Plano premium necessário',
      details: 'Esta funcionalidade requer um plano premium'
    });
  }

  next();
};

// Middleware para verificar se é administrador
export const requireAdmin = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      error: 'Autenticação necessária'
    });
  }

  // Verificar se é admin (você pode adicionar um campo 'role' no schema User)
  if (req.user.email !== 'admin@mentor-ai.com') {
    await Audit.log({
      userId: req.user._id,
      action: 'security_violation',
      details: { 
        reason: 'unauthorized_admin_access',
        endpoint: req.originalUrl
      },
      metadata: {
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        endpoint: req.originalUrl
      },
      severity: 'critical',
      success: false
    });

    return res.status(403).json({
      error: 'Acesso negado'
    });
  }

  next();
};