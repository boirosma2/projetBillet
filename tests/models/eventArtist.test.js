import { sequelize } from '../../config/database.js';
import { EventArtist, Event, Artist, Venue, City, Organizer, EventType } from '../../models/index.js';

/**
 * Test pour le modèle EventArtist et les relations many-to-many
 * Ces tests vérifient la relation N-N entre Event et Artist via la table de jointure EventArtist
 */
describe('EventArtist Model', () => {
  // Variables pour stocker les objets de test
  let testCity, testVenue, testOrganizer, testEventType, testEvent, testArtist, testEventArtist;

  /**
   * Initialisation des données de test pour les cas de tests
   * Dans cette section, on crée des entités de test en commençant par les entités indépendantes (City)
   * puis en remontant la chaîne de dépendances jusqu'aux entités dépendantes (Event, Artist)
   */
  beforeAll(async () => {
    try {
      // Créer un environnement de test isolé avec des entités factices

      // Test #1: Création de la ville - Prérequis pour Venue
      console.log('Création de la ville de test...');
      testCity = await City.create({
        name: 'Test City',
        country: 'Test Country'
      });
      console.log(`Ville créée avec ID: ${testCity.id}`);

      // Test #2: Création du lieu - Prérequis pour Event
      console.log('Création du lieu de test...');
      testVenue = await Venue.create({
        name: 'Test Venue',
        address: 'Test Address, 12345',
        city_id: testCity.id,
        capacity: 1000
      });
      console.log(`Lieu créé avec ID: ${testVenue.id}`);

      // Test #3: Création de l'organisateur - Prérequis pour Event
      console.log('Création de l\'organisateur de test...');
      // Générer un email unique avec timestamp pour éviter les violations de contrainte unique
      const uniqueEmail = `test-${Date.now()}@organizer.com`;
      testOrganizer = await Organizer.create({
        name: 'Test Organizer',
        email: uniqueEmail,
        bio: 'Test organizer bio'
      });
      console.log(`Organisateur créé avec ID: ${testOrganizer.id}`);

      // Test #4: Création du type d'événement - Prérequis pour Event
      console.log('Création du type d\'événement de test...');
      // Générer un nom unique avec timestamp pour éviter les violations de contrainte unique
      const uniqueTypeName = `Test Event Type ${Date.now()}`;
      testEventType = await EventType.create({
        name: uniqueTypeName,
        description: 'Test event type description'
      });
      console.log(`Type d'événement créé avec ID: ${testEventType.id}`);

      // Test #5: Création de l'événement
      console.log('Création de l\'événement de test...');
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 30); // 30 jours dans le futur

      // Création de l'événement avec les IDs des entités liées
      testEvent = await Event.create({
        title: 'Test Event',
        description: 'Test event description',
        date: futureDate,
        venue_id: testVenue.id,
        organizer_id: testOrganizer.id,
        event_type_id: testEventType.id,
        total_tickets: 100,
        available_tickets: 100,
        price: 25.00,
        status: 'upcoming'
      });
      console.log(`Événement créé avec ID: ${testEvent.id}`);

      // Test #6: Création de l'artiste
      console.log('Création de l\'artiste de test...');
      testArtist = await Artist.create({
        name: 'Test Artist',
        genre: 'Test Genre',
        bio: 'Test artist bio'
      });
      console.log(`Artiste créé avec ID: ${testArtist.id}`);

      // Test #7: Création de l'association événement-artiste
      console.log('Création de l\'association événement-artiste de test...');
      testEventArtist = await EventArtist.create({
        event_id: testEvent.id,
        artist_id: testArtist.id,
        position: 'Headliner'
      });
      console.log(`Association événement-artiste créée avec ID: ${testEventArtist.id}`);

    } catch (error) {
      console.error('Erreur lors de l\'initialisation des tests:', error);
      throw error;
    }
  });

  /**
   * Nettoyage après tous les tests
   * Suppression des entités de test dans l'ordre inverse de leur création
   * pour éviter les erreurs de clé étrangère
   */
  afterAll(async () => {
    console.log('Nettoyage des données de test...');
    try {
      // Suppression dans l'ordre inverse des dépendances
      if (testEventArtist) await testEventArtist.destroy();
      if (testArtist) await testArtist.destroy();
      if (testEvent) await testEvent.destroy();
      if (testEventType) await testEventType.destroy();
      if (testOrganizer) await testOrganizer.destroy();
      if (testVenue) await testVenue.destroy();
      if (testCity) await testCity.destroy();
      await sequelize.close();
      console.log('Nettoyage terminé avec succès');
    } catch (error) {
      console.error('Erreur lors du nettoyage des tests:', error);
    }
  });

  /**
   * Test #8: Vérification de la création d'une association événement-artiste
   * Ce test vérifie qu'un lien entre un événement et un artiste est correctement créé
   */
  it('should create a valid event-artist association', async () => {
    // Cette association est déjà créée dans beforeAll, on vérifie simplement qu'elle existe
    const eventArtist = await EventArtist.findOne({
      where: {
        event_id: testEvent.id,
        artist_id: testArtist.id
      }
    });

    // Vérification des propriétés de l'association
    expect(eventArtist).toBeDefined();
    expect(eventArtist.event_id).toBe(testEvent.id);
    expect(eventArtist.artist_id).toBe(testArtist.id);
    expect(eventArtist.position).toBe('Headliner');
  });

  /**
   * Test #9: Vérification de l'unicité de l'association événement-artiste
   * Ce test vérifie qu'on ne peut pas créer deux associations identiques (même événement, même artiste)
   */
  it('should not create a duplicate event-artist association', async () => {
    // Tentative de création d'une association dupliquée
    const eventArtistData = {
      event_id: testEvent.id,
      artist_id: testArtist.id,
      position: 'Support' // Position différente, mais même événement et artiste
    };

    // Devrait échouer car nous avons déjà créé cette association dans beforeAll
    await expect(EventArtist.create(eventArtistData)).rejects.toThrow();
  });

  /**
   * Test #10: Vérification de la relation Many-to-Many depuis Event
   * Ce test vérifie qu'on peut récupérer les artistes d'un événement via la relation
   */
  it('should retrieve artists for an event through the association', async () => {
    // Récupération de l'événement avec ses artistes
    const eventWithArtists = await Event.findByPk(testEvent.id, {
      include: {
        model: Artist,
        as: 'artists'
      }
    });

    // Vérification des propriétés
    expect(eventWithArtists).toBeDefined();
    expect(eventWithArtists.artists).toBeDefined();
    expect(eventWithArtists.artists.length).toBe(1);
    expect(eventWithArtists.artists[0].id).toBe(testArtist.id);
    expect(eventWithArtists.artists[0].EventArtist.position).toBe('Headliner');
  });

  /**
   * Test #11: Vérification de la relation Many-to-Many depuis Artist
   * Ce test vérifie qu'on peut récupérer les événements d'un artiste via la relation
   */
  it('should retrieve events for an artist through the association', async () => {
    // Récupération de l'artiste avec ses événements
    const artistWithEvents = await Artist.findByPk(testArtist.id, {
      include: {
        model: Event,
        as: 'events'
      }
    });

    // Vérification des propriétés
    expect(artistWithEvents).toBeDefined();
    expect(artistWithEvents.events).toBeDefined();
    expect(artistWithEvents.events.length).toBe(1);
    expect(artistWithEvents.events[0].id).toBe(testEvent.id);
    expect(artistWithEvents.events[0].EventArtist.position).toBe('Headliner');
  });
});