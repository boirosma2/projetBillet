import User from './User.js';
import Event from './Event.js';
import Ticket from './Ticket.js';
import City from './City.js';
import Venue from './Venue.js';
import Organizer from './Organizer.js';
import Artist from './Artist.js';
import EventType from './EventType.js';
import EventArtist from './EventArtist.js';
import Banner from './Banner.js';
import BannerClick from './BannerClick.js';

// Définir les associations entre les modèles

// Associations User
User.hasMany(Ticket, { 
  foreignKey: 'user_id',
  as: 'tickets'
});

// Associations City
City.hasMany(Venue, {
  foreignKey: 'city_id',
  as: 'venues'
});

// Associations Venue
Venue.belongsTo(City, {
  foreignKey: 'city_id',
  as: 'city'
});

Venue.hasMany(Event, {
  foreignKey: 'venue_id',
  as: 'events'
});

// Associations Organizer
Organizer.hasMany(Event, {
  foreignKey: 'organizer_id',
  as: 'events'
});

// Associations EventType
EventType.hasMany(Event, {
  foreignKey: 'event_type_id',
  as: 'events'
});

// Associations Event
Event.belongsTo(Venue, {
  foreignKey: 'venue_id',
  as: 'venue'
});

Event.belongsTo(Organizer, {
  foreignKey: 'organizer_id',
  as: 'organizer'
});

Event.belongsTo(EventType, {
  foreignKey: 'event_type_id',
  as: 'eventType'
});

Event.hasMany(Ticket, { 
  foreignKey: 'event_id',
  as: 'tickets'
});


Event.belongsToMany(Artist, {
  through: EventArtist,
  foreignKey: 'event_id',
  otherKey: 'artist_id',
  as: 'artists'
});

// Associations Artist
Artist.belongsToMany(Event, {
  through: EventArtist,
  foreignKey: 'artist_id',
  otherKey: 'event_id',
  as: 'events'
});

// Associations EventArtist
EventArtist.belongsTo(Event, {
  foreignKey: 'event_id',
  as: 'event'
});

EventArtist.belongsTo(Artist, {
  foreignKey: 'artist_id',
  as: 'artist'
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
Event.hasMany(Banner, {
  foreignKey: 'event_id',
  as: 'banners'
});

Banner.belongsTo(Event, {
  foreignKey: 'event_id',
  as: 'event'
});

// Associations BannerClick
Banner.hasMany(BannerClick, {
  foreignKey: 'banner_id',
  as: 'clicks'
});

BannerClick.belongsTo(Banner, {
  foreignKey: 'banner_id',
  as: 'banner'
});

User.hasMany(BannerClick, {
  foreignKey: 'user_id',
  as: 'banner_clicks'
});

BannerClick.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user'
});

export {
  User,
  Event,
  Ticket,
  City,
  Venue,
  Organizer,
  Artist,
  EventType,
  EventArtist,
  Banner,
  BannerClick
};