import Joi from 'joi';

// Schéma de validation pour la création d'un lieu
export const createVenueSchema = Joi.object({
  name: Joi.string().min(2).max(100).required()
    .messages({
      'string.base': 'Le nom doit être une chaîne de caractères',
      'string.empty': 'Le nom ne doit pas être vide',
      'string.min': 'Le nom doit contenir au moins {#limit} caractères',
      'string.max': 'Le nom ne doit pas dépasser {#limit} caractères',
      'any.required': 'Le nom est obligatoire'
    }),
  
  address: Joi.string().min(5).max(255).required()
    .messages({
      'string.base': 'L\'adresse doit être une chaîne de caractères',
      'string.empty': 'L\'adresse ne doit pas être vide',
      'string.min': 'L\'adresse doit contenir au moins {#limit} caractères',
      'string.max': 'L\'adresse ne doit pas dépasser {#limit} caractères',
      'any.required': 'L\'adresse est obligatoire'
    }),
  
  city_id: Joi.number().integer().positive().required()
    .messages({
      'number.base': 'L\'ID de la ville doit être un nombre',
      'number.integer': 'L\'ID de la ville doit être un entier',
      'number.positive': 'L\'ID de la ville doit être positif',
      'any.required': 'L\'ID de la ville est obligatoire'
    }),
  
  capacity: Joi.number().integer().min(1).required()
    .messages({
      'number.base': 'La capacité doit être un nombre',
      'number.integer': 'La capacité doit être un entier',
      'number.min': 'La capacité doit être d\'au moins {#limit}',
      'any.required': 'La capacité est obligatoire'
    }),
  
  description: Joi.string().allow('', null)
    .messages({
      'string.base': 'La description doit être une chaîne de caractères'
    })
});

// Schéma de validation pour la mise à jour d'un lieu
export const updateVenueSchema = Joi.object({
  name: Joi.string().min(2).max(100)
    .messages({
      'string.base': 'Le nom doit être une chaîne de caractères',
      'string.empty': 'Le nom ne doit pas être vide',
      'string.min': 'Le nom doit contenir au moins {#limit} caractères',
      'string.max': 'Le nom ne doit pas dépasser {#limit} caractères'
    }),
  
  address: Joi.string().min(5).max(255)
    .messages({
      'string.base': 'L\'adresse doit être une chaîne de caractères',
      'string.empty': 'L\'adresse ne doit pas être vide',
      'string.min': 'L\'adresse doit contenir au moins {#limit} caractères',
      'string.max': 'L\'adresse ne doit pas dépasser {#limit} caractères'
    }),
  
  city_id: Joi.number().integer().positive()
    .messages({
      'number.base': 'L\'ID de la ville doit être un nombre',
      'number.integer': 'L\'ID de la ville doit être un entier',
      'number.positive': 'L\'ID de la ville doit être positif'
    }),
  
  capacity: Joi.number().integer().min(1)
    .messages({
      'number.base': 'La capacité doit être un nombre',
      'number.integer': 'La capacité doit être un entier',
      'number.min': 'La capacité doit être d\'au moins {#limit}'
    }),
  
  description: Joi.string().allow('', null)
    .messages({
      'string.base': 'La description doit être une chaîne de caractères'
    })
}).min(1);