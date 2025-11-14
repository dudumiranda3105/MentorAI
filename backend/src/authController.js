import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Joi from 'joi';
import { User, Audit } from '../models/index.js';

export class AuthController {
  // Schemas de validação
  static registerSchema = Joi.object({
    name: Joi.string().min(2).max(50).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).max(128).required(),
    confirmPassword: Joi.string().valid(Joi.ref('password')).required()
  });

  static loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  });

  static changePasswordSchema = Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: Joi.string().min(6).max(128).required(),
    confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required()
  });

  // Registrar usuário
  static async register(req, res) {
    try {
      // Validar dados
      const { error, value } = AuthController.registerSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          error: 'Dados inválidos',
          details: error.details[0].message
        });
      }

      const { name, email, password } = value;

      // Verificar se usuário já existe
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        await Audit.log({
          action: 'user_register',
          details: { email, reason: 'email_already_exists' },
          metadata: AuthController.getRequestMetadata(req),
          severity: 'warning',
          success: false
        });

        return res.status(409).json({
          error: 'Email já está em uso'
        });
      }

      // Hash da senha
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Criar usuário
      const user = new User({
        name: name.trim(),
        email: email.toLowerCase(),
        password: hashedPassword,
        preferences: {
          theme: 'auto',
          language: 'pt-br',
          notifications: {
            email: true,
            push: true
          },
          agentContext: {
            systemPrompt: 'Você é um assistente educacional especializado em criar flashcards e responder perguntas sobre documentos. Seja claro, conciso e pedagogicamente útil.',
            personality: 'friendly',
            expertise: ['educação', 'flashcards', 'estudo'],
            customInstructions: ''
          }
        },
        subscription: {
          plan: 'free',
          isActive: false
        }
      });

      await user.save();

      // Log de auditoria
      await Audit.log({
        userId: user._id,
        action: 'user_register',
        resource: { type: 'user', id: user._id },
        details: { email, name },
        metadata: AuthController.getRequestMetadata(req),
        severity: 'info'
      });

      // Gerar token
      const token = AuthController.generateToken(user);

      // Remover senha da resposta
      const userResponse = user.toObject();
      delete userResponse.password;

      res.status(201).json({
        message: 'Usuário criado com sucesso',
        user: userResponse,
        token
      });

    } catch (error) {
      console.error('Erro no registro:', error);

      await Audit.log({
        action: 'api_error',
        details: { endpoint: '/api/auth/register', error: error.message },
        metadata: AuthController.getRequestMetadata(req),
        severity: 'error',
        success: false,
        error: {
          message: error.message,
          stack: error.stack
        }
      });

      res.status(500).json({
        error: 'Erro interno do servidor'
      });
    }
  }

  // Login de usuário
  static async login(req, res) {
    try {
      // Validar dados
      const { error, value } = AuthController.loginSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          error: 'Dados inválidos',
          details: error.details[0].message
        });
      }

      const { email, password } = value;

      // Buscar usuário
      const user = await User.findOne({ 
        email: email.toLowerCase(),
        isActive: true 
      });

      if (!user) {
        await Audit.log({
          action: 'user_login',
          details: { email, reason: 'user_not_found' },
          metadata: AuthController.getRequestMetadata(req),
          severity: 'warning',
          success: false
        });

        return res.status(401).json({
          error: 'Email ou senha inválidos'
        });
      }

      // Verificar senha
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        await Audit.log({
          userId: user._id,
          action: 'user_login',
          details: { email, reason: 'invalid_password' },
          metadata: AuthController.getRequestMetadata(req),
          severity: 'warning',
          success: false
        });

        return res.status(401).json({
          error: 'Email ou senha inválidos'
        });
      }

      // Atualizar último login
      user.lastLogin = new Date();
      await user.save();

      // Log de auditoria
      await Audit.log({
        userId: user._id,
        action: 'user_login',
        details: { email },
        metadata: AuthController.getRequestMetadata(req),
        severity: 'info'
      });

      // Gerar token
      const token = AuthController.generateToken(user);

      // Remover senha da resposta
      const userResponse = user.toObject();
      delete userResponse.password;

      res.json({
        message: 'Login realizado com sucesso',
        user: userResponse,
        token
      });

    } catch (error) {
      console.error('Erro no login:', error);

      await Audit.log({
        action: 'api_error',
        details: { endpoint: '/api/auth/login', error: error.message },
        metadata: AuthController.getRequestMetadata(req),
        severity: 'error',
        success: false,
        error: {
          message: error.message,
          stack: error.stack
        }
      });

      res.status(500).json({
        error: 'Erro interno do servidor'
      });
    }
  }

  // Logout (opcional, principalmente para auditoria)
  static async logout(req, res) {
    try {
      await Audit.log({
        userId: req.user._id,
        action: 'user_logout',
        details: { email: req.user.email },
        metadata: AuthController.getRequestMetadata(req),
        severity: 'info'
      });

      res.json({
        message: 'Logout realizado com sucesso'
      });
    } catch (error) {
      console.error('Erro no logout:', error);
      res.status(500).json({
        error: 'Erro interno do servidor'
      });
    }
  }

  // Obter perfil do usuário logado
  static async getProfile(req, res) {
    try {
      const user = await User.findById(req.user._id).select('-password');
      
      if (!user) {
        return res.status(404).json({
          error: 'Usuário não encontrado'
        });
      }

      res.json({
        user
      });
    } catch (error) {
      console.error('Erro ao obter perfil:', error);
      res.status(500).json({
        error: 'Erro interno do servidor'
      });
    }
  }

  // Atualizar perfil
  static async updateProfile(req, res) {
    try {
      const updateSchema = Joi.object({
        name: Joi.string().min(2).max(50),
        preferences: Joi.object({
          theme: Joi.string().valid('light', 'dark', 'auto'),
          language: Joi.string(),
          notifications: Joi.object({
            email: Joi.boolean(),
            push: Joi.boolean()
          })
        })
      });

      const { error, value } = updateSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          error: 'Dados inválidos',
          details: error.details[0].message
        });
      }

      const user = await User.findByIdAndUpdate(
        req.user._id,
        value,
        { new: true, runValidators: true }
      ).select('-password');

      await Audit.log({
        userId: user._id,
        action: 'user_update',
        resource: { type: 'user', id: user._id },
        details: { updatedFields: Object.keys(value) },
        metadata: AuthController.getRequestMetadata(req),
        severity: 'info'
      });

      res.json({
        message: 'Perfil atualizado com sucesso',
        user
      });
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      res.status(500).json({
        error: 'Erro interno do servidor'
      });
    }
  }

  // Alterar senha
  static async changePassword(req, res) {
    try {
      const { error, value } = AuthController.changePasswordSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          error: 'Dados inválidos',
          details: error.details[0].message
        });
      }

      const { currentPassword, newPassword } = value;

      const user = await User.findById(req.user._id);
      if (!user) {
        return res.status(404).json({
          error: 'Usuário não encontrado'
        });
      }

      // Verificar senha atual
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        await Audit.log({
          userId: user._id,
          action: 'password_change',
          details: { reason: 'invalid_current_password' },
          metadata: AuthController.getRequestMetadata(req),
          severity: 'warning',
          success: false
        });

        return res.status(401).json({
          error: 'Senha atual inválida'
        });
      }

      // Hash da nova senha
      const hashedNewPassword = await bcrypt.hash(newPassword, 12);
      user.password = hashedNewPassword;
      await user.save();

      await Audit.log({
        userId: user._id,
        action: 'password_change',
        details: { success: true },
        metadata: AuthController.getRequestMetadata(req),
        severity: 'info'
      });

      res.json({
        message: 'Senha alterada com sucesso'
      });
    } catch (error) {
      console.error('Erro ao alterar senha:', error);
      res.status(500).json({
        error: 'Erro interno do servidor'
      });
    }
  }

  // Gerar token JWT
  static generateToken(user) {
    return jwt.sign(
      {
        userId: user._id,
        email: user.email,
        name: user.name
      },
      process.env.JWT_SECRET || 'mentor-ai-secret-key',
      {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d'
      }
    );
  }

  // Obter contexto do agente
  static async getAgentContext(req, res) {
    try {
      let user = await User.findById(req.user._id);
      
      if (!user) {
        return res.status(404).json({
          error: 'Usuário não encontrado'
        });
      }

      // Se o usuário não tem preferências ou contexto do agente, cria valores padrão
      if (!user.preferences) {
        user.preferences = {};
      }

      if (!user.preferences.agentContext) {
        const defaultContext = {
          systemPrompt: 'Você é um assistente educacional especializado em criar flashcards e responder perguntas sobre documentos. Seja claro, conciso e pedagogicamente útil.',
          personality: 'friendly',
          expertise: ['educação', 'flashcards', 'estudo'],
          customInstructions: ''
        };

        user.preferences.agentContext = defaultContext;
        await user.save();
      }

      res.json({
        agentContext: user.preferences.agentContext
      });
    } catch (error) {
      console.error('Erro ao obter contexto do agente:', error);
      res.status(500).json({
        error: 'Erro interno do servidor'
      });
    }
  }

  // Atualizar contexto do agente
  static async updateAgentContext(req, res) {
    try {
      const contextSchema = Joi.object({
        systemPrompt: Joi.string().allow('').max(2000),
        personality: Joi.string().valid('formal', 'casual', 'friendly', 'professional'),
        expertise: Joi.array().items(Joi.string().max(50)).max(10),
        customInstructions: Joi.string().allow('').max(1000)
      });

      const { error, value } = contextSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          error: 'Dados inválidos',
          details: error.details[0].message
        });
      }

      const user = await User.findByIdAndUpdate(
        req.user._id,
        { 
          $set: {
            'preferences.agentContext': value
          }
        },
        { new: true, runValidators: true }
      ).select('preferences.agentContext');

      await Audit.log({
        userId: user._id,
        action: 'agent_context_update',
        resource: { type: 'user', id: user._id },
        details: { updatedFields: Object.keys(value) },
        metadata: AuthController.getRequestMetadata(req),
        severity: 'info'
      });

      res.json({
        message: 'Contexto do agente atualizado com sucesso',
        agentContext: user.preferences.agentContext
      });
    } catch (error) {
      console.error('Erro ao atualizar contexto do agente:', error);
      res.status(500).json({
        error: 'Erro interno do servidor'
      });
    }
  }

  // Extrair metadata da requisição
  static getRequestMetadata(req) {
    return {
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent'),
      endpoint: req.originalUrl,
      method: req.method
    };
  }
}