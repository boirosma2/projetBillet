import Joi from 'joi';

// Schéma de validation pour la création d'une ville
export const createCitySchema = Joi.object({
  name: Joi.string().min(2).max(100).required()
    .messages({
      'string.base': 'Le nom doit être une chaîne de caractères',
      'string.empty': 'Le nom ne doit pas être vide',
      'string.min': 'Le nom doit contenir au moins {#limit} caractères',
      'string.max': 'Le nom ne doit pas dépasser {#limit} caractères',
      'any.required': 'Le nom est obligatoire'
    }),
  
  country: Joi.string().min(2).max(100).required()
    .messages({
      'string.base': 'Le pays doit être une chaîne de caractères',
      'string.empty': 'Le pays ne doit pas être vide',
      'string.min': 'Le pays doit contenir au moins {#limit} caractères',
      'string.max': 'Le pays ne doit pas dépasser {#limit} caractères',
      'any.required': 'Le pays est obligatoire'
    })
});

// Schéma de validation pour la mise à jour d'une ville
export const updateCitySchema = Joi.object({
  name: Joi.string().min(2).max(100)
    .messages({
      'string.base': 'Le nom doit être une chaîne de caractères',
      'string.empty': 'Le nom ne doit pas être vide',
      'string.min': 'Le nom doit contenir au moins {#limit} caractères',
      'string.max': 'Le nom ne doit pas dépasser {#limit} caractères'
    }),
  
  country: Joi.string().min(2).max(100)
    .messages({
      'string.base': 'Le pays doit être une chaîne de caractères',
      'string.empty': 'Le pays ne doit pas être vide',
      'string.min': 'Le pays doit contenir au moins {#limit} caractères',
      'string.max': 'Le pays ne doit pas dépasser {#limit} caractères'
    })
}).min(1);