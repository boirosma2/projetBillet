import Joi from 'joi';

/**
 * Schéma pour la création d'un événement
 */
export const createEventSchema = Joi.object({
  title: Joi.string().min(3).max(100).required()
    .messages({
      'string.base': 'Le titre doit être une chaîne de caractères',
      'string.empty': 'Le titre ne peut pas être vide',
      'string.min': 'Le titre doit contenir au moins {#limit} caractères',
      'string.max': 'Le titre ne doit pas dépasser {#limit} caractères',
      'any.required': 'Le titre est requis'
    }),
  
  description: Joi.string().min(10).max(2000).required()
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
  
  venue_id: Joi.number().integer().positive().required()
    .messages({
      'number.base': 'L\'ID du lieu doit être un nombre',
      'number.integer': 'L\'ID du lieu doit être un entier',
      'number.positive': 'L\'ID du lieu doit être positif',
      'any.required': 'L\'ID du lieu est requis'
    }),
    
  organizer_id: Joi.number().integer().positive().allow(null)
    .messages({
      'number.base': 'L\'ID de l\'organisateur doit être un nombre',
      'number.integer': 'L\'ID de l\'organisateur doit être un entier',
      'number.positive': 'L\'ID de l\'organisateur doit être positif'
    }),
    
  event_type_id: Joi.number().integer().positive().allow(null)
    .messages({
      'number.base': 'L\'ID du type d\'événement doit être un nombre',
      'number.integer': 'L\'ID du type d\'événement doit être un entier',
      'number.positive': 'L\'ID du type d\'événement doit être positif'
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
    }),
    
  image_path: Joi.string().allow('', null)
    .messages({
      'string.base': 'Le chemin de l\'image doit être une chaîne de caractères'
    }),
    
  artists: Joi.array().items(
    Joi.object({
      artist_id: Joi.number().integer().positive().required()
        .messages({
          'number.base': 'L\'ID de l\'artiste doit être un nombre',
          'number.integer': 'L\'ID de l\'artiste doit être un entier',
          'number.positive': 'L\'ID de l\'artiste doit être positif',
          'any.required': 'L\'ID de l\'artiste est obligatoire'
        }),
      position: Joi.string().max(50).allow('', null)
        .messages({
          'string.base': 'La position doit être une chaîne de caractères',
          'string.max': 'La position ne doit pas dépasser {#limit} caractères'
        }),
      performance_time: Joi.date().iso().allow(null)
        .messages({
          'date.base': 'L\'heure de passage doit être une date valide',
          'date.format': 'L\'heure de passage doit être au format ISO 8601'
        })
    })
  ).allow(null)
});

/**
 * Schéma pour la mise à jour d'un événement
 */
export const updateEventSchema = Joi.object({
  title: Joi.string().min(3).max(100)
    .messages({
      'string.base': 'Le titre doit être une chaîne de caractères',
      'string.empty': 'Le titre ne peut pas être vide',
      'string.min': 'Le titre doit contenir au moins {#limit} caractères',
      'string.max': 'Le titre ne doit pas dépasser {#limit} caractères'
    }),
  
  description: Joi.string().min(10).max(2000)
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
  
  venue_id: Joi.number().integer().positive()
    .messages({
      'number.base': 'L\'ID du lieu doit être un nombre',
      'number.integer': 'L\'ID du lieu doit être un entier',
      'number.positive': 'L\'ID du lieu doit être positif'
    }),
    
  organizer_id: Joi.number().integer().positive().allow(null)
    .messages({
      'number.base': 'L\'ID de l\'organisateur doit être un nombre',
      'number.integer': 'L\'ID de l\'organisateur doit être un entier',
      'number.positive': 'L\'ID de l\'organisateur doit être positif'
    }),
    
  event_type_id: Joi.number().integer().positive().allow(null)
    .messages({
      'number.base': 'L\'ID du type d\'événement doit être un nombre',
      'number.integer': 'L\'ID du type d\'événement doit être un entier',
      'number.positive': 'L\'ID du type d\'événement doit être positif'
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
    }),
    
  image_path: Joi.string().allow('', null)
    .messages({
      'string.base': 'Le chemin de l\'image doit être une chaîne de caractères'
    }),
    
  status: Joi.string().valid('upcoming', 'active', 'completed', 'cancelled')
    .messages({
      'string.base': 'Le statut doit être une chaîne de caractères',
      'string.empty': 'Le statut ne peut pas être vide',
      'any.only': 'Le statut doit être l\'un des suivants: upcoming, active, completed, cancelled'
    })
}).min(1).messages({ 'object.min': 'Au moins un champ doit être fourni pour la mise à jour' });

/**
 * Schéma pour l'ajout d'un artiste à un événement
 */
export const addArtistToEventSchema = Joi.object({
  artist_id: Joi.number().integer().positive().required()
    .messages({
      'number.base': 'L\'ID de l\'artiste doit être un nombre',
      'number.integer': 'L\'ID de l\'artiste doit être un entier',
      'number.positive': 'L\'ID de l\'artiste doit être positif',
      'any.required': 'L\'ID de l\'artiste est obligatoire'
    }),
  
  position: Joi.string().max(50).allow('', null)
    .messages({
      'string.base': 'La position doit être une chaîne de caractères',
      'string.max': 'La position ne doit pas dépasser {#limit} caractères'
    }),
  
  performance_time: Joi.date().iso().allow(null)
    .messages({
      'date.base': 'L\'heure de passage doit être une date valide',
      'date.format': 'L\'heure de passage doit être au format ISO 8601'
    })
});

/**
 * Schéma pour la mise à jour d'un artiste dans un événement
 */
export const updateEventArtistSchema = Joi.object({
  position: Joi.string().max(50).allow('', null)
    .messages({
      'string.base': 'La position doit être une chaîne de caractères',
      'string.max': 'La position ne doit pas dépasser {#limit} caractères'
    }),
  
  performance_time: Joi.date().iso().allow(null)
    .messages({
      'date.base': 'L\'heure de passage doit être une date valide',
      'date.format': 'L\'heure de passage doit être au format ISO 8601'
    })
}).min(1).messages({ 'object.min': 'Au moins un champ doit être fourni pour la mise à jour' });