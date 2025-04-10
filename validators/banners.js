import Joi from 'joi';

export const createBannerSchema = Joi.object({
  title: Joi.string().min(3).max(100).required()
    .messages({
      'string.base': 'Le titre doit être une chaîne de caractères',
      'string.empty': 'Le titre ne peut pas être vide',
      'string.min': 'Le titre doit contenir au moins {#limit} caractères',
      'string.max': 'Le titre ne doit pas dépasser {#limit} caractères',
      'any.required': 'Le titre est requis'
    }),
  
  description: Joi.string().min(10).max(1000).required()
    .messages({
      'string.base': 'La description doit être une chaîne de caractères',
      'string.empty': 'La description ne peut pas être vide',
      'string.min': 'La description doit contenir au moins {#limit} caractères',
      'string.max': 'La description ne doit pas dépasser {#limit} caractères',
      'any.required': 'La description est requise'
    }),
  
  event_id: Joi.number().integer().positive().allow(null)
    .messages({
      'number.base': 'L\'ID de l\'événement doit être un nombre',
      'number.integer': 'L\'ID de l\'événement doit être un entier',
      'number.positive': 'L\'ID de l\'événement doit être positif'
    }),
  
  is_active: Joi.boolean()
    .messages({
      'boolean.base': 'Le statut d\'activation doit être un booléen'
    }),
    
  start_date: Joi.date().iso().allow(null)
    .messages({
      'date.base': 'La date de début doit être une date valide',
      'date.format': 'La date de début doit être au format ISO 8601'
    }),
    
  end_date: Joi.date().iso().min(Joi.ref('start_date')).allow(null)
    .messages({
      'date.base': 'La date de fin doit être une date valide',
      'date.format': 'La date de fin doit être au format ISO 8601',
      'date.min': 'La date de fin doit être postérieure à la date de début'
    }),
    
  display_order: Joi.number().integer().min(0)
    .messages({
      'number.base': 'L\'ordre d\'affichage doit être un nombre',
      'number.integer': 'L\'ordre d\'affichage doit être un entier',
      'number.min': 'L\'ordre d\'affichage ne peut pas être négatif'
    })
});

export const updateBannerSchema = Joi.object({
  title: Joi.string().min(3).max(100)
    .messages({
      'string.base': 'Le titre doit être une chaîne de caractères',
      'string.empty': 'Le titre ne peut pas être vide',
      'string.min': 'Le titre doit contenir au moins {#limit} caractères',
      'string.max': 'Le titre ne doit pas dépasser {#limit} caractères'
    }),
  
  description: Joi.string().min(10).max(1000)
    .messages({
      'string.base': 'La description doit être une chaîne de caractères',
      'string.empty': 'La description ne peut pas être vide',
      'string.min': 'La description doit contenir au moins {#limit} caractères',
      'string.max': 'La description ne doit pas dépasser {#limit} caractères'
    }),
  
  event_id: Joi.number().integer().positive().allow(null)
    .messages({
      'number.base': 'L\'ID de l\'événement doit être un nombre',
      'number.integer': 'L\'ID de l\'événement doit être un entier',
      'number.positive': 'L\'ID de l\'événement doit être positif'
    }),
  
  is_active: Joi.boolean()
    .messages({
      'boolean.base': 'Le statut d\'activation doit être un booléen'
    }),
    
  start_date: Joi.date().iso().allow(null)
    .messages({
      'date.base': 'La date de début doit être une date valide',
      'date.format': 'La date de début doit être au format ISO 8601'
    }),
    
  end_date: Joi.date().iso().min(Joi.ref('start_date')).allow(null)
    .messages({
      'date.base': 'La date de fin doit être une date valide',
      'date.format': 'La date de fin doit être au format ISO 8601',
      'date.min': 'La date de fin doit être postérieure à la date de début'
    }),
    
  display_order: Joi.number().integer().min(0)
    .messages({
      'number.base': 'L\'ordre d\'affichage doit être un nombre',
      'number.integer': 'L\'ordre d\'affichage doit être un entier',
      'number.min': 'L\'ordre d\'affichage ne peut pas être négatif'
    })
}).min(1).messages({ 'object.min': 'Au moins un champ doit être fourni pour la mise à jour' });

export const bannerOrderSchema = Joi.object({
  bannerOrders: Joi.array().items(
    Joi.object({
      id: Joi.number().integer().positive().required(),
      order: Joi.number().integer().min(0).required()
    })
  ).min(1).required()
    .messages({
      'array.base': 'Le tableau d\'ordre des bannières doit être un tableau',
      'array.min': 'Vous devez fournir au moins un ordre de bannière',
      'any.required': 'Le tableau d\'ordre des bannières est requis'
    })
});