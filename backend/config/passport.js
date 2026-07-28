const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

// Fallback only covers the current production deployment; every environment
// should really set GOOGLE_CALLBACK_URL itself (it must match the redirect
// URI registered in the Google Cloud Console for that environment).
const DEFAULT_CALLBACK_URL = 'https://online-graphic-design-services-plat.vercel.app/api/auth/google/callback';
const callbackURL = process.env.GOOGLE_CALLBACK_URL || DEFAULT_CALLBACK_URL;

console.log('🔍 Checking Google OAuth credentials...');
console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? '✅ Found' : '❌ Missing');
console.log('GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET ? '✅ Found' : '❌ Missing');
console.log('GOOGLE_CALLBACK_URL:', process.env.GOOGLE_CALLBACK_URL ? `✅ Found (${callbackURL})` : `⚠️ Missing, using default (${callbackURL})`);

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ googleId: profile.id });

        if (user) {
          return done(null, user);
        }

        user = await User.findOne({ email: profile.emails[0].value });

        if (user) {
          user.googleId = profile.id;
          user.profilePicture = user.profilePicture || profile.photos[0]?.value;
          await user.save();
          return done(null, user);
        }

        // No password: the schema only requires one when googleId is unset.
        const newUser = await User.create({
          googleId: profile.id,
          name: profile.displayName,
          email: profile.emails[0].value,
          profilePicture: profile.photos[0]?.value,
          role: 'client',
          phone: '',
          address: ''
        });

        done(null, newUser);
      } catch (error) {
        console.error('Google OAuth error:', error);
        done(error, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;