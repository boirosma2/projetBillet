// Mock du middleware de validation pour les tests
export default function validateMock(schema) {
  return (req, res, next) => {
    // Skip validation in tests
    next();
  };
}