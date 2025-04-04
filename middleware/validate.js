/**
 * Middleware de validation générique
 * 
 * Utilisation :
 * router.post('/', validate(someSchema), (req, res) => { ... })
 * 
 * @param {Object} schema - Schéma Joi pour valider le corps de la requête
 * @returns {Function} Middleware Express
 */
export const validate = (schema) => {
  return (req, res, next) => {
    // Si aucun schéma n'est fourni, passer à l'étape suivante
    if (!schema) return next();

    // Validation du corps de la requête
    const { error, value } = schema.validate(req.body, {
      abortEarly: false, // Retourne toutes les erreurs, pas seulement la première
      stripUnknown: true // Supprime les propriétés non définies dans le schéma
    });

    // Si des erreurs de validation sont présentes
    if (error) {
      // Formater les messages d'erreur
      const errorMessages = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      // Retourner une réponse d'erreur 400 Bad Request
      return res.status(400).json({ 
        message: 'Erreur de validation des données',
        errors: errorMessages
      });
    }

    // Si tout est valide, remplacer req.body par les données validées
    req.body = value;
    
    // Passer à l'étape suivante du pipeline de middleware
    next();
  };
};

export default validate;