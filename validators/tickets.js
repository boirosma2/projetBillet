import Joi from 'joi';

// Schéma de validation pour l'achat d'un ticket
export const purchaseTicketSchema = Joi.object({
  event_id: Joi.number().integer().positive().required()
    .messages({
      'number.base': 'L\'identifiant de l\'événement doit être un nombre',
      'number.integer': 'L\'identifiant de l\'événement doit être un entier',
      'number.positive': 'L\'identifiant de l\'événement doit être positif',
      'any.required': 'L\'identifiant de l\'événement est requis'
    })
});