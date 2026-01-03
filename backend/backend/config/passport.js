const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const { User } = require('../models/pg');

// Google OAuth Strategy - Only configure if credentials are available
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL || "/auth/google/callback"
  }, async (accessToken, refreshToken, profile, done) => {
  try {
    // Check if user already exists by Google ID
    let user = await User.findByGoogleId(profile.id);
    
    if (!user) {
      // Check by email
      user = await User.findByEmail(profile.emails[0].value.toLowerCase());
    }

    if (user) {
      // User exists, update Google ID if not set
      if (!user.google_id) {
        await User.update(user.id, { google_id: profile.id });
      }
      return done(null, user);
    }

    // Create new user - but we need user_type, so redirect to registration
    const userData = {
      googleId: profile.id,
      email: profile.emails[0].value,
      firstName: profile.name.givenName,
      lastName: profile.name.familyName,
      avatarUrl: profile.photos[0]?.value,
      needsRegistration: true
    };

    return done(null, userData);
  } catch (error) {
    console.error('❌ Google OAuth Error:', error);
    return done(error, null);
  }
}));
} else {
  console.log('⚠️  Google OAuth not configured - skipping GoogleStrategy');
}

// JWT Strategy
if (process.env.JWT_SECRET) {
  passport.use(new JwtStrategy({
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET
  }, async (payload, done) => {
    try {
      const user = await User.findById(payload.id);
      if (user) {
        // Remove password from user object
        delete user.password;
        return done(null, user);
      }
      return done(null, false);
    } catch (error) {
      console.error('❌ JWT Strategy Error:', error);
      return done(error, false);
    }
  }));
} else {
  console.log('⚠️  JWT_SECRET not configured - JWT authentication disabled');
}

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user.id || user.googleId);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    let user = await User.findById(id);
    if (!user) {
      user = await User.findByGoogleId(id);
    }
    if (user) {
      delete user.password;
      done(null, user);
    } else {
      done(null, false);
    }
  } catch (error) {
    console.error('❌ Deserialize Error:', error);
    done(error, null);
  }
});

module.exports = passport;
