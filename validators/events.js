import Joi from 'joi';

// Schéma de validation pour la création d'un événement
export const createEventSchema = Joi.object({
  title: Joi.string().min(3).max(100).required()
    .messages({
      'string.base': 'Le titre doit être une chaîne de caractères',
      'string.empty': 'Le titre ne peut pas être vide',
      'string.min': 'Le titre doit contenir au moins {#limit} caractères',
      'string.max': 'Le titre ne doit pas dépasser {#limit} caractères',
      'any.required': 'Le titre est requis'
    }),
  
  description: Joi.string().min(10).max(500).required()
    .messages({
      'string.base': 'La description doit être une chaîne de caractères',
      'string.empty': 'La description ne peut pas être vide',
      'string.min': 'La description doit contenir au moins {#limit} caractères',
      'string.max': 'La description ne doit pas dépasser {#limit} caractères',
      'any.required': 'La description est requise'
    }),
  
  date: Joi.date().greater('now').required()
    .messages({
      'date.base': 'La date doit être une date valide',
      'date.greater': 'La date doit être ultérieure à aujourd\'hui',
      'any.required': 'La date est requise'
    }),
  
  venue: Joi.string().min(3).max(100).required()
    .messages({
      'string.base': 'Le lieu doit être une chaîne de caractères',
      'string.empty': 'Le lieu ne peut pas être vide',
      'string.min': 'Le lieu doit contenir au moins {#limit} caractères',
      'string.max': 'Le lieu ne doit pas dépasser {#limit} caractères',
      'any.required': 'Le lieu est requis'
    }),
  
  total_tickets: Joi.number().integer().min(1).required()
    .messages({
      'number.base': 'Le nombre total de tickets doit être un nombre',
      'number.integer': 'Le nombre total de tickets doit être un entier',
      'number.min': 'Le nombre total de tickets doit être au moins {#limit}',
      'any.required': 'Le nombre total de tickets est requis'
    }),
  
  available_tickets: Joi.number().integer().min(0)
    .max(Joi.ref('total_tickets'))
    .messages({
      'number.base': 'Le nombre de tickets disponibles doit être un nombre',
      'number.integer': 'Le nombre de tickets disponibles doit être un entier',
      'number.min': 'Le nombre de tickets disponibles ne peut pas être négatif',
      'number.max': 'Le nombre de tickets disponibles ne peut pas être supérieur au nombre total de tickets'
    })
    .default(Joi.ref('total_tickets')),
  
  price: Joi.number().precision(2).min(0).required()
    .messages({
      'number.base': 'Le prix doit être un nombre',
      'number.precision': 'Le prix ne peut avoir que 2 décimales maximum',
      'number.min': 'Le prix ne peut pas être négatif',
      'any.required': 'Le prix est requis'
    })
});

// Schéma de validation pour la mise à jour d'un événement
export const updateEventSchema = Joi.object({
  title: Joi.string().min(3).max(100)
    .messages({
      'string.base': 'Le titre doit être une chaîne de caractères',
      'string.empty': 'Le titre ne peut pas être vide',
      'string.min': 'Le titre doit contenir au moins {#limit} caractères',
      'string.max': 'Le titre ne doit pas dépasser {#limit} caractères'
    }),
  
  description: Joi.string().min(10).max(500)
    .messages({
      'string.base': 'La description doit être une chaîne de caractères',
      'string.empty': 'La description ne peut pas être vide',
      'string.min': 'La description doit contenir au moins {#limit} caractères',
      'string.max': 'La description ne doit pas dépasser {#limit} caractères'
    }),
  
  date: Joi.date().greater('now')
    .messages({
      'date.base': 'La date doit être une date valide',
      'date.greater': 'La date doit être ultérieure à aujourd\'hui'
    }),
  
  venue: Joi.string().min(3).max(100)
    .messages({
      'string.base': 'Le lieu doit être une chaîne de caractères',
      'string.empty': 'Le lieu ne peut pas être vide',
      'string.min': 'Le lieu doit contenir au moins {#limit} caractères',
      'string.max': 'Le lieu ne doit pas dépasser {#limit} caractères'
    }),
  
  total_tickets: Joi.number().integer().min(1)
    .messages({
      'number.base': 'Le nombre total de tickets doit être un nombre',
      'number.integer': 'Le nombre total de tickets doit être un entier',
      'number.min': 'Le nombre total de tickets doit être au moins {#limit}'
    }),
  
  available_tickets: Joi.number().integer().min(0)
    .max(Joi.ref('total_tickets'))
    .messages({
      'number.base': 'Le nombre de tickets disponibles doit être un nombre',
      'number.integer': 'Le nombre de tickets disponibles doit être un entier',
      'number.min': 'Le nombre de tickets disponibles ne peut pas être négatif',
      'number.max': 'Le nombre de tickets disponibles ne peut pas être supérieur au nombre total de tickets'
    }),
  
  price: Joi.number().precision(2).min(0)
    .messages({
      'number.base': 'Le prix doit être un nombre',
      'number.precision': 'Le prix ne peut avoir que 2 décimales maximum',
      'number.min': 'Le prix ne peut pas être négatif'
    })
}).min(1).messages({ 'object.min': 'Au moins un champ doit être fourni pour la mise à jour' });