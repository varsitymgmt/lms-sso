import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';

/*
Error Code list:
AU01 - EMail mismatch
AU02 - Password mismatch
*/
function localAuthenticate(req, User, login, password, done) {
  // can login through both username and emailId
  User.findOne({
    $or: [
      {
        email: login.toLowerCase(),
      },
      {
        username: login,
      },
    ],
    active: true,
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
      // console.info('user', user.hostname, req.body.hostname);
      if (user.hostname !== req.body.hostname) {
        // console.info('not matching', user.hostname);

        return done(null, false, {
          message: 'This email/username is not registered.',
          code: 'AU01',
        });
      }
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
