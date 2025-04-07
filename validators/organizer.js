import Joi from 'joi';

// Schéma de validation pour la création d'un organisateur
export const createOrganizerSchema = Joi.object({
  name: Joi.string().min(2).max(100).required()
    .messages({
      'string.base': 'Le nom doit être une chaîne de caractères',
      'string.empty': 'Le nom ne doit pas être vide',
      'string.min': 'Le nom doit contenir au moins {#limit} caractères',
      'string.max': 'Le nom ne doit pas dépasser {#limit} caractères',
      'any.required': 'Le nom est obligatoire'
    }),
  
  email: Joi.string().email().required()
    .messages({
      'string.base': 'L\'email doit être une chaîne de caractères',
      'string.empty': 'L\'email ne doit pas être vide',
      'string.email': 'L\'email doit être une adresse email valide',
      'any.required': 'L\'email est obligatoire'
    }),
  
  bio: Joi.string().allow('', null)
    .messages({
      'string.base': 'La biographie doit être une chaîne de caractères'
    })
});

// Schéma de validation pour la mise à jour d'un organisateur
export const updateOrganizerSchema = Joi.object({
  name: Joi.string().min(2).max(100)
    .messages({
      'string.base': 'Le nom doit être une chaîne de caractères',
      'string.empty': 'Le nom ne doit pas être vide',
      'string.min': 'Le nom doit contenir au moins {#limit} caractères',
      'string.max': 'Le nom ne doit pas dépasser {#limit} caractères'
    }),
  
  email: Joi.string().email()
    .messages({
      'string.base': 'L\'email doit être une chaîne de caractères',
      'string.empty': 'L\'email ne doit pas être vide',
      'string.email': 'L\'email doit être une adresse email valide'
    }),
  
  bio: Joi.string().allow('', null)
    .messages({
      'string.base': 'La biographie doit être une chaîne de caractères'
    })
}).min(1);