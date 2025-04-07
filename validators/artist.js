import Joi from 'joi';

// Schéma de validation pour la création d'un artiste
export const createArtistSchema = Joi.object({
  name: Joi.string().min(2).max(100).required()
    .messages({
      'string.base': 'Le nom doit être une chaîne de caractères',
      'string.empty': 'Le nom ne doit pas être vide',
      'string.min': 'Le nom doit contenir au moins {#limit} caractères',
      'string.max': 'Le nom ne doit pas dépasser {#limit} caractères',
      'any.required': 'Le nom est obligatoire'
    }),
  
  genre: Joi.string().min(2).max(50).required()
    .messages({
      'string.base': 'Le genre doit être une chaîne de caractères',
      'string.empty': 'Le genre ne doit pas être vide',
      'string.min': 'Le genre doit contenir au moins {#limit} caractères',
      'string.max': 'Le genre ne doit pas dépasser {#limit} caractères',
      'any.required': 'Le genre est obligatoire'
    }),
  
  bio: Joi.string().allow('', null)
    .messages({
      'string.base': 'La biographie doit être une chaîne de caractères'
    }),
  
  image_path: Joi.string().allow('', null)
    .messages({
      'string.base': 'Le chemin de l\'image doit être une chaîne de caractères'
    })
});

// Schéma de validation pour la mise à jour d'un artiste
export const updateArtistSchema = Joi.object({
  name: Joi.string().min(2).max(100)
    .messages({
      'string.base': 'Le nom doit être une chaîne de caractères',
      'string.empty': 'Le nom ne doit pas être vide',
      'string.min': 'Le nom doit contenir au moins {#limit} caractères',
      'string.max': 'Le nom ne doit pas dépasser {#limit} caractères'
    }),
  
  genre: Joi.string().min(2).max(50)
    .messages({
      'string.base': 'Le genre doit être une chaîne de caractères',
      'string.empty': 'Le genre ne doit pas être vide',
      'string.min': 'Le genre doit contenir au moins {#limit} caractères',
      'string.max': 'Le genre ne doit pas dépasser {#limit} caractères'
    }),
  
  bio: Joi.string().allow('', null)
    .messages({
      'string.base': 'La biographie doit être une chaîne de caractères'
    }),
  
  image_path: Joi.string().allow('', null)
    .messages({
      'string.base': 'Le chemin de l\'image doit être une chaîne de caractères'
    })
}).min(1);

// Schéma de validation pour l'ajout d'un artiste à un événement
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