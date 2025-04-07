import { sequelize } from '../../config/database.js';
import { City } from '../../models/index.js';

describe('City Model', () => {
  // Nettoyer la base de données après les tests
  afterAll(async () => {
    await sequelize.close();
  });

  it('should create a valid city', async () => {
    const cityData = {
      name: 'Test City',
      country: 'Test Country'
    };

    const city = await City.create(cityData);
    expect(city).toBeDefined();
    expect(city.name).toBe('Test City');
    expect(city.country).toBe('Test Country');
    
    // Nettoyer
    await city.destroy();
  });

  it('should not create a city without a name', async () => {
    const cityData = {
      country: 'Test Country'
    };

    await expect(City.create(cityData)).rejects.toThrow();
  });

  it('should not create a city without a country', async () => {
    const cityData = {
      name: 'Test City'
    };

    await expect(City.create(cityData)).rejects.toThrow();
  });

  it('should not create a city with a name too short', async () => {
    const cityData = {
      name: 'A', // moins de 2 caractères
      country: 'Test Country'
    };

    await expect(City.create(cityData)).rejects.toThrow();
  });

  it('should have the correct associations', () => {
    expect(City.associations.venues).toBeDefined();
    expect(City.associations.venues.associationType).toBe('HasMany');
    expect(City.associations.venues.target.name).toBe('Venue');
  });
});