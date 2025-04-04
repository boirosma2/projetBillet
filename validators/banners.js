import Joi from 'joi';

// Schéma de validation pour la création d'une bannière
export const createBannerSchema = Joi.object({
  event_id: Joi.number().integer().positive().allow(null)
    .messages({
      'number.base': 'L\'identifiant de l\'événement doit être un nombre',
      'number.integer': 'L\'identifiant de l\'événement doit être un entier',
      'number.positive': 'L\'identifiant de l\'événement doit être positif'
    }),
  
  title: Joi.string().min(3).max(100).required()
    .messages({
      'string.base': 'Le titre doit être une chaîne de caractères',
      'string.empty': 'Le titre ne peut pas être vide',
      'string.min': 'Le titre doit contenir au moins {#limit} caractères',
      'string.max': 'Le titre ne doit pas dépasser {#limit} caractères',
      'any.required': 'Le titre est requis'
    }),
  
  start_date: Joi.date().required()
    .messages({
      'date.base': 'La date de début doit être une date valide',
      'any.required': 'La date de début est requise'
    }),
  
  end_date: Joi.date().greater(Joi.ref('start_date')).required()
    .messages({
      'date.base': 'La date de fin doit être une date valide',
      'date.greater': 'La date de fin doit être ultérieure à la date de début',
      'any.required': 'La date de fin est requise'
    }),
  
  is_active: Joi.boolean()
    .messages({
      'boolean.base': 'Le statut d\'activation doit être un booléen'
    })
    .default(true)
});

// Schéma de validation pour la mise à jour d'une bannière
export const updateBannerSchema = Joi.object({
  event_id: Joi.number().integer().positive().allow(null)
    .messages({
      'number.base': 'L\'identifiant de l\'événement doit être un nombre',
      'number.integer': 'L\'identifiant de l\'événement doit être un entier',
      'number.positive': 'L\'identifiant de l\'événement doit être positif'
    }),
  
  title: Joi.string().min(3).max(100)
    .messages({
      'string.base': 'Le titre doit être une chaîne de caractères',
      'string.empty': 'Le titre ne peut pas être vide',
      'string.min': 'Le titre doit contenir au moins {#limit} caractères',
      'string.max': 'Le titre ne doit pas dépasser {#limit} caractères'
    }),
  
  start_date: Joi.date()
    .messages({
      'date.base': 'La date de début doit être une date valide'
    }),
  
  end_date: Joi.date().when('start_date', {
    is: Joi.exist(),
    then: Joi.date().greater(Joi.ref('start_date')),
    otherwise: Joi.date()
  }).messages({
    'date.base': 'La date de fin doit être une date valide',
    'date.greater': 'La date de fin doit être ultérieure à la date de début'
  }),
  
  is_active: Joi.boolean()
    .messages({
      'boolean.base': 'Le statut d\'activation doit être un booléen'
    })
}).min(1).messages({ 'object.min': 'Au moins un champ doit être fourni pour la mise à jour' });