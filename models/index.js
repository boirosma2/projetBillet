import User from './User.js';
import Event from './Event.js';
import Ticket from './Ticket.js';
import Banner from './Banner.js';

// Définir les associations entre les modèles

// Associations User
User.hasMany(Ticket, { 
  foreignKey: 'user_id',
  as: 'tickets'
});

// Associations Event
Event.hasMany(Ticket, { 
  foreignKey: 'event_id',
  as: 'tickets'
});

Event.hasMany(Banner, { 
  foreignKey: 'event_id',
  as: 'banners'
});

// Associations Ticket
Ticket.belongsTo(User, { 
  foreignKey: 'user_id',
  as: 'user'
});

Ticket.belongsTo(Event, { 
  foreignKey: 'event_id',
  as: 'event'
});

// Associations Banner
Banner.belongsTo(Event, { 
  foreignKey: 'event_id',
  as: 'event'
});

export {
  User,
  Event,
  Ticket,
  Banner
};