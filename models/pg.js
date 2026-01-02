// PostgreSQL Models Export
// This file exports all PostgreSQL-based models

module.exports = {
  User: require('./User'),
  ServiceProvider: require('./ServiceProvider'),
  Service: require('./Service'),
  Booking: require('./Booking'),
  Review: require('./Review'),
  Payment: require('./Payment'),
  Notification: require('./Notification'),
  TravelerStory: require('./TravelerStory'),
  StoryLike: require('./StoryLike'),
  StoryComment: require('./StoryComment'),
  ServicePromotion: require('./ServicePromotion')
};
