'use strict';
const bcrypt = require('bcryptjs');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Hasher les mots de passe pour les utilisateurs de démo
    const hash = await bcrypt.hash('Password123!', 10);
    
    // 1. Insérer des utilisateurs de démo
    await queryInterface.bulkInsert('users', [
      {
        username: 'admin',
        email: 'admin@example.com',
        password: hash,
        role: 'admin',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        username: 'user',
        email: 'user@example.com',
        password: hash,
        role: 'regular',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});
    
    // 2. Ajouter des villes
    await queryInterface.bulkInsert('cities', [
      {
        name: 'Paris',
        country: 'France',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Lyon',
        country: 'France',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Marseille',
        country: 'France',
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);
    
    // Récupérer les IDs des villes insérées
    const cities = await queryInterface.sequelize.query(
      'SELECT id FROM cities;',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    // 3. Ajouter des lieux (venues)
    await queryInterface.bulkInsert('venues', [
      {
        name: 'Zénith de Paris',
        address: '211 Avenue Jean Jaurès, 75019 Paris',
        city_id: cities[0].id,
        capacity: 6800,
        description: 'Salle de concert emblématique de Paris',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Olympia',
        address: '28 Boulevard des Capucines, 75009 Paris',
        city_id: cities[0].id,
        capacity: 2000,
        description: 'Salle de spectacle mythique',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Halle Tony Garnier',
        address: '20 Place Docteurs Charles et Christophe Mérieux, 69007 Lyon',
        city_id: cities[1].id,
        capacity: 17000,
        description: 'Grande salle de concert lyonnaise',
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);

    // 4. Ajouter des organisateurs
    await queryInterface.bulkInsert('organizers', [
      {
        name: 'Live Nation',
        email: 'contact@livenation.fr',
        bio: 'Leader mondial de l\'organisation de concerts et événements',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Fimalac Entertainment',
        email: 'contact@fimalac.fr',
        bio: 'Groupe français spécialisé dans le divertissement',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Festival Productions',
        email: 'contact@festivalprod.fr',
        bio: 'Organisation de festivals en France',
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);

    // 5. Ajouter des types d'événements
    await queryInterface.bulkInsert('event_types', [
      {
        name: 'Concert',
        description: 'Représentation musicale par un ou plusieurs artistes',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Festival',
        description: 'Événement musical sur plusieurs jours avec plusieurs artistes',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Théâtre',
        description: 'Représentation théâtrale',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Conférence',
        description: 'Présentation ou débat sur un sujet spécifique',
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);

    // 6. Ajouter des artistes
    await queryInterface.bulkInsert('artists', [
      {
        name: 'Artiste 1',
        genre: 'Rock',
        bio: 'Un artiste de rock français renommé',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Artiste 2',
        genre: 'Pop',
        bio: 'Chanteur pop à succès',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Artiste 3',
        genre: 'Électro',
        bio: 'DJ et producteur de musique électronique',
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);

    // Récupérer les IDs des entités insérées
    const venues = await queryInterface.sequelize.query(
      'SELECT id FROM venues;',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );
    
    const organizers = await queryInterface.sequelize.query(
      'SELECT id FROM organizers;',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );
    
    const eventTypes = await queryInterface.sequelize.query(
      'SELECT id FROM event_types;',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    const users = await queryInterface.sequelize.query(
      'SELECT id FROM users;',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    // 7. Insérer des événements de démo (avec les clés étrangères obligatoires)
    await queryInterface.bulkInsert('events', [
      {
        title: 'Concert de Jazz',
        description: 'Une soirée exceptionnelle avec les meilleurs musiciens de jazz de la région.',
        date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // dans 30 jours
        venue_id: venues[0].id,
        organizer_id: organizers[0].id,
        event_type_id: eventTypes[0].id,
        total_tickets: 200,
        available_tickets: 200,
        price: 45.00,
        status: 'upcoming',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        title: 'Festival d\'été',
        description: 'Trois jours de musique, d\'art et de gastronomie en plein air.',
        date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // dans 60 jours
        venue_id: venues[1].id, 
        organizer_id: organizers[1].id,
        event_type_id: eventTypes[1].id,
        total_tickets: 1000,
        available_tickets: 1000,
        price: 75.50,
        status: 'upcoming',
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});
    
    // 8. Récupérer les IDs des événements créés
    const events = await queryInterface.sequelize.query(
      'SELECT id, price FROM events;',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );
    
    // 9. Récupérer les IDs des artistes insérés
    const artists = await queryInterface.sequelize.query(
      'SELECT id FROM artists;',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    // 10. Ajouter des associations événements-artistes
    if (events.length > 0 && artists.length > 0) {
      const eventArtistsData = [];
      
      // Associer chaque artiste au premier événement
      for (let i = 0; i < artists.length; i++) {
        eventArtistsData.push({
          event_id: events[0].id,
          artist_id: artists[i].id,
          position: i === 0 ? 'Headliner' : 'Support',
          created_at: new Date(),
          updated_at: new Date()
        });
      }
      
      // Associer un artiste au deuxième événement
      if (events.length > 1) {
        eventArtistsData.push({
          event_id: events[1].id,
          artist_id: artists[0].id,
          position: 'Headliner',
          created_at: new Date(),
          updated_at: new Date()
        });
      }
      
      await queryInterface.bulkInsert('event_artists', eventArtistsData);
    }
    
    // 11. Générer un code de ticket pour le démo
    const generateTicketCode = () => {
      const random = Math.random().toString(36).substring(2, 8).toUpperCase();
      const timestamp = Date.now().toString(36).toUpperCase();
      return `TIX-${random}-${timestamp}`;
    };
    
    // 12. Créer quelques tickets
    if (users.length > 0 && events.length > 0) {
      await queryInterface.bulkInsert('tickets', [
        {
          event_id: events[0].id,
          user_id: users[0].id,
          ticket_code: generateTicketCode(),
          status: 'paid',
          price_paid: events[0].price,
          purchase_date: new Date(),
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          event_id: events[1].id,
          user_id: users[0].id,
          ticket_code: generateTicketCode(),
          status: 'paid',
          price_paid: events[1].price,
          purchase_date: new Date(),
          created_at: new Date(),
          updated_at: new Date()
        }
      ], {});
      
      // 13. Mettre à jour le nombre de billets disponibles
      await queryInterface.sequelize.query(
        `UPDATE events SET available_tickets = available_tickets - 1 WHERE id = ${events[0].id}`
      );
      
      await queryInterface.sequelize.query(
        `UPDATE events SET available_tickets = available_tickets - 1 WHERE id = ${events[1].id}`
      );
    }

    // 14. Ajouter des bannières promotionnelles de démo
    if (events.length > 0) {
      await queryInterface.bulkInsert('banners', [
        {
          title: 'Festival d\'été 2025',
          description: 'Ne manquez pas le plus grand festival de l\'année ! 3 jours de musique non-stop.',
          image_path: '/uploads/demo-banner1.jpg',
          event_id: events[1].id,
          is_active: true,
          start_date: new Date(),
          end_date: new Date(new Date().setMonth(new Date().getMonth() + 3)),
          display_order: 1,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          title: 'Concert de Jazz',
          description: 'Soirée jazz exceptionnelle avec les meilleurs musiciens de la région.',
          image_path: '/uploads/demo-banner2.jpg',
          event_id: events[0].id,
          is_active: false,
          start_date: new Date(new Date().setDate(new Date().getDate() + 15)),
          end_date: new Date(new Date().setMonth(new Date().getMonth() + 2)),
          display_order: 2,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          title: 'Promotion du mois',
          description: '20% de réduction sur tous les événements ce mois-ci. Utilisez le code PROMO20.',
          image_path: '/uploads/demo-banner3.jpg',
          event_id: null,
          is_active: false,
          start_date: new Date(),
          end_date: new Date(new Date().setDate(new Date().getDate() + 30)),
          display_order: 3,
          created_at: new Date(),
          updated_at: new Date()
        }
      ], {});

      // 15. Ajouter quelques clics de démonstration sur les bannières
      const banners = await queryInterface.sequelize.query(
        'SELECT id FROM banners;',
        { type: queryInterface.sequelize.QueryTypes.SELECT }
      );

      if (banners.length > 0 && users.length > 0) {
        const clicksData = [];
        
        // Ajouter des clics pour la première bannière (par un utilisateur connecté)
        for (let i = 0; i < 5; i++) {
          clicksData.push({
            banner_id: banners[0].id,
            user_id: users[0].id,
            ip_address: '127.0.0.1',
            user_agent: 'Mozilla/5.0 (Demo Browser)',
            clicked_at: new Date(new Date().setDate(new Date().getDate() - i))
          });
        }
        
        // Ajouter des clics pour la deuxième bannière (visiteurs anonymes)
        for (let i = 0; i < 3; i++) {
          clicksData.push({
            banner_id: banners[1].id,
            user_id: null,
            ip_address: '192.168.1.1',
            user_agent: 'Mozilla/5.0 (Demo Mobile Browser)',
            clicked_at: new Date(new Date().setDate(new Date().getDate() - i))
          });
        }
        
        await queryInterface.bulkInsert('banner_clicks', clicksData, {});
      }
    }
  },

  async down(queryInterface, Sequelize) {
    // Supprimer toutes les données de démo (dans l'ordre inverse pour respecter les contraintes)
    await queryInterface.bulkDelete('banner_clicks', null, {});
    await queryInterface.bulkDelete('banners', null, {});
    await queryInterface.bulkDelete('tickets', null, {});
    await queryInterface.bulkDelete('event_artists', null, {});
    await queryInterface.bulkDelete('events', null, {});
    await queryInterface.bulkDelete('artists', null, {});
    await queryInterface.bulkDelete('event_types', null, {});
    await queryInterface.bulkDelete('organizers', null, {});
    await queryInterface.bulkDelete('venues', null, {});
    await queryInterface.bulkDelete('cities', null, {});
    await queryInterface.bulkDelete('users', null, {});
  }
};