'use strict';
const bcrypt = require('bcryptjs');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Hasher les mots de passe pour les utilisateurs de démo
    const hash = await bcrypt.hash('Password123!', 10);
    
    // Insérer des utilisateurs de démo
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
    
    // Insérer des événements de démo
    await queryInterface.bulkInsert('events', [
      {
        title: 'Concert de Jazz',
        description: 'Une soirée exceptionnelle avec les meilleurs musiciens de jazz de la région.',
        date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // dans 30 jours
        venue: 'Salle de Concert Le Méridien',
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
        venue: 'Parc Central',
        total_tickets: 1000,
        available_tickets: 1000,
        price: 75.50,
        status: 'upcoming',
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});
    
    // Récupérer les IDs des utilisateurs et événements créés
    const users = await queryInterface.sequelize.query(
      'SELECT id FROM users;',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );
    
    const events = await queryInterface.sequelize.query(
      'SELECT id, price FROM events;',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );
    
    // Générer un code de ticket pour le démo
    const generateTicketCode = () => {
      const random = Math.random().toString(36).substring(2, 8).toUpperCase();
      const timestamp = Date.now().toString(36).toUpperCase();
      return `TIX-${random}-${timestamp}`;
    };
    
    // Créer quelques tickets
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
      
      // Mettre à jour le nombre de billets disponibles pour les événements avec des billets vendus
      await queryInterface.sequelize.query(
        `UPDATE events SET available_tickets = available_tickets - 1 WHERE id = ${events[0].id}`
      );
      
      await queryInterface.sequelize.query(
        `UPDATE events SET available_tickets = available_tickets - 1 WHERE id = ${events[1].id}`
      );
    }
  },

  async down(queryInterface, Sequelize) {
    // Supprimer toutes les données de démo
    await queryInterface.bulkDelete('tickets', null, {});
    await queryInterface.bulkDelete('banners', null, {});
    await queryInterface.bulkDelete('events', null, {});
    await queryInterface.bulkDelete('users', null, {});
  }
};