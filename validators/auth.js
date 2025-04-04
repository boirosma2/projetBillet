import Joi from 'joi';

// Schéma de validation pour l'inscription
export const registerSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required()
    .messages({
      'string.base': 'Le nom d\'utilisateur doit être une chaîne de caractères',
      'string.empty': 'Le nom d\'utilisateur ne peut pas être vide',
      'string.min': 'Le nom d\'utilisateur doit contenir au moins {#limit} caractères',
      'string.max': 'Le nom d\'utilisateur ne doit pas dépasser {#limit} caractères',
      'string.alphanum': 'Le nom d\'utilisateur ne doit contenir que des caractères alphanumériques',
      'any.required': 'Le nom d\'utilisateur est requis'
    }),
  
  email: Joi.string().email().required()
    .messages({
      'string.base': 'L\'email doit être une chaîne de caractères',
      'string.empty': 'L\'email ne peut pas être vide',
      'string.email': 'L\'email doit être valide',
      'any.required': 'L\'email est requis'
    }),
  
  password: Joi.string()
    .min(8)
    .max(30)
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
    .required()
    .messages({
      'string.base': 'Le mot de passe doit être une chaîne de caractères',
      'string.empty': 'Le mot de passe ne peut pas être vide',
      'string.min': 'Le mot de passe doit contenir au moins {#limit} caractères',
      'string.max': 'Le mot de passe ne doit pas dépasser {#limit} caractères',
      'string.pattern.base': 'Le mot de passe doit contenir au moins une lettre majuscule, une lettre minuscule, un chiffre et un caractère spécial',
      'any.required': 'Le mot de passe est requis'
    })
});

// Schéma de validation pour la connexion
export const loginSchema = Joi.object({
  email: Joi.string().email().required()
    .messages({
      'string.base': 'L\'email doit être une chaîne de caractères',
      'string.empty': 'L\'email ne peut pas être vide',
      'string.email': 'L\'email doit être valide',
      'any.required': 'L\'email est requis'
    }),
  
  password: Joi.string().required()
    .messages({
      'string.base': 'Le mot de passe doit être une chaîne de caractères',
      'string.empty': 'Le mot de passe ne peut pas être vide',
      'any.required': 'Le mot de passe est requis'
    })
});