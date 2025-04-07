import Joi from 'joi';

// Schéma de validation pour la création d'un type d'événement
export const createEventTypeSchema = Joi.object({
  name: Joi.string().min(2).max(50).required()
    .messages({
      'string.base': 'Le nom doit être une chaîne de caractères',
      'string.empty': 'Le nom ne doit pas être vide',
      'string.min': 'Le nom doit contenir au moins {#limit} caractères',
      'string.max': 'Le nom ne doit pas dépasser {#limit} caractères',
      'any.required': 'Le nom est obligatoire'
    }),
  
  description: Joi.string().allow('', null)
    .messages({
      'string.base': 'La description doit être une chaîne de caractères'
    })
});

// Schéma de validation pour la mise à jour d'un type d'événement
export const updateEventTypeSchema = Joi.object({
  name: Joi.string().min(2).max(50)
    .messages({
      'string.base': 'Le nom doit être une chaîne de caractères',
      'string.empty': 'Le nom ne doit pas être vide',
      'string.min': 'Le nom doit contenir au moins {#limit} caractères',
      'string.max': 'Le nom ne doit pas dépasser {#limit} caractères'
    }),
  
  description: Joi.string().allow('', null)
    .messages({
      'string.base': 'La description doit être une chaîne de caractères'
    })
}).min(1);