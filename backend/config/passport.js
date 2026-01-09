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
    const googleEmail = profile.emails[0].value.toLowerCase();
    
    // Check if user already exists by Google ID
    let user = await User.findByGoogleId(profile.id);
    
    if (user) {
      // Existing Google user - just log them in
      console.log('✅ Existing Google user found by google_id:', user.email);
      return done(null, user);
    }
    
    // Check by email - user might have registered with email first
    user = await User.findByEmail(googleEmail);

    if (user) {
      // User exists with email, link Google account
      console.log('🔗 Linking Google account to existing email user:', user.email);
      
      // Determine new auth_provider
      const newAuthProvider = user.password ? 'both' : 'google';
      
      await User.update(user.id, { 
        google_id: profile.id,
        avatar_url: user.avatar_url || profile.photos[0]?.value,
        auth_provider: newAuthProvider
      });
      
      // Refresh user data
      user = await User.findById(user.id);
      return done(null, user);
    }

    // New user - needs to select role before completing registration
    console.log('🆕 New Google user, needs role selection:', googleEmail);
    const userData = {
      googleId: profile.id,
      email: googleEmail,
      firstName: profile.name.givenName || '',
      lastName: profile.name.familyName || '',
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
