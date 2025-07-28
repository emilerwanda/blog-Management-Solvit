import express from "express";
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { sequelize } from '../database/config/sequelize';
import { UserModal } from '../database/models/User';
import dotenv from 'dotenv'
dotenv.config()

const app = express();
const User = UserModal(sequelize);

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    callbackURL: process.env.GOOGLE_CALLBACK_URL || '',
    scope: ['profile', 'email', 'name', 'photo'],
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails && profile.emails.length > 0 ? profile.emails[0].value : undefined;
      if (!email) return done(new Error('No email found in Google profile'));
      let user = await User.findOne({ where: { email } });
      if (!user) {
        user = await User.create({
          name: profile.displayName,
          email,
          photo: profile.photos && profile.photos.length > 0 ? profile.photos[0].value : '',
          role: 'normal',
        });
      }
      done(null, user);
    } catch (err) {
      done(err);
    }
  }
));


passport.serializeUser((user: any, done) => {
  done(null, user.id);
});


passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await User.findByPk(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

