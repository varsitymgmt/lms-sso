import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
// import { config } from '../../../config/environment';

/*
Error Code list:
AU01 - EMail mismatch
AU02 - Password mismatch
*/
function localAuthenticate(req, User, login, password, done) {
  const hostnameForQuery = req.body.hostname ? req.body.hostname : '';
  // can login through both username and emailId
  User.findOne({
    $or: [
      {
        email: login.toLowerCase(),
      },
      {
        username: login.toUpperCase(),
      },
    ],
    active: true,
    hostname: hostnameForQuery,
  })
    .exec()
    .then(user => {
      // return done(null, user);
      if (!user) {
        return done(null, false, {
          message: 'This email/username is not registered.',
          code: 'AU01',
        });
      }

      // if (
      //   user.hostname !== req.body.hostname &&
      //   config.hostNameForAccounts !== req.body.hostname
      // ) {
      //   return done(null, false, {
      //     message: 'This email/username is not registered.',
      //     code: 'AU01',
      //   });
      // }

      return user.authenticate(password, (authError, authenticated) => {
        if (authError) {
          return done(authError);
        }
        if (!authenticated) {
          return done(null, false, {
            message: 'This password is not correct.',
            code: 'AU02',
          });
        }
        return done(null, user);
      });
    })
    .catch(err => done(err));
}

export default function setup(User /* config */) {
  passport.use(
    new LocalStrategy(
      {
        usernameField: 'email',
        passwordField: 'password', // this is the virtual field on the model
        passReqToCallback: true,
      },
      (req, email, password, done) =>
        localAuthenticate(req, User, email, password, done),
    ),
  );
}

export { setup };
