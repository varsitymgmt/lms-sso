import jwt from 'jsonwebtoken';
import expressJwt from 'express-jwt';
import compose from 'composable-middleware';
import { config } from '../../config/environment';
import User from '../api/v1/user/user.model';

const validateJwt = expressJwt({
  secret: config.secrets.session,
});

/**
 * @author Gaurav Chauhan
 * @description Verify and decode the access token provided,if invalid it reject the request.
 */
export function verifyJWTToken(token, userId) {
  return new Promise((resolve, reject) => {
    jwt.verify(
      token,
      config.secrets.session,
      (err, decodedToken) =>
        err || !decodedToken || userId !== decodedToken._id // eslint-disable-line
          ? reject(err)
          : resolve(decodedToken),
    );
  });
}

/**
 * Attaches the user object to the request if authenticated
 * Otherwise returns 403
 * Also attach access data with req.user.authorization object
 */
export function isAuthenticated(
  isPasswordChangeRequest = false,
  isRefreshToken = false,
) {
  return (
    compose()
      // Validate jwt
      .use((req, res, next) => {
        // allow access_token to be passed through query parameter as well
        if (req.query && req.query.hasOwnProperty('access_token')) { // eslint-disable-line
          req.headers.authorization = `Bearer ${req.query.access_token}`;
        }
        // IE11 forgets to set Authorization header sometimes. Pull from cookie instead.
        if (req.query && typeof req.headers.authorization === 'undefined') {
          req.headers.authorization = `Bearer ${req.cookies.token}`;
        }
        validateJwt(req, res, next);
      })
      // Attach user to request
      .use((req, res, next) => {
        User.findById(req.user._id) // eslint-disable-line
          .exec()
          .then(user => {
            const { hierarchy } = user;
            if (!user) {
              return res.status(401).end();
            }
            if (!isPasswordChangeRequest && !user.passwordChange) {
              res.statusMessage = 'User need to change his password';
              return res.status(401).end();
            }
            // console.info('hostname', req.user.hostname);
            if (req.user.hostname !== user.hostname) {
              res.statusMessage = 'hostname does not Match';
              return res.status(401).end();
            }
            if (isRefreshToken) {
              return next();
            }
            const userData = JSON.parse(JSON.stringify(user));
            delete userData.hierarchy;
            const { accesscontroltoken } = req.headers;
            return verifyJWTToken(accesscontroltoken, req.user._id.toString()) // eslint-disable-line
              .then(({ access }) => {
                access.hierarchy = hierarchy.map(x => x.childCode);
                userData.access = access;
                req.user = userData;
                return next();
              })
              .catch(err => {
                console.error(err);
                return res.status(403).end();
              });
          })
          .catch(err => next(err));
      })
  );
}

/**
 * Checks if the user role meets the minimum requirements of the route
 */
export function hasRole(roleRequired) {
  if (!roleRequired) {
    throw new Error('Required role needs to be set');
  }

  return compose()
    .use(isAuthenticated())
    .use((req, res, next) => {
      if (
        config.userRoles.indexOf(req.user.role) >=
        config.userRoles.indexOf(roleRequired)
      ) {
        return next();
      }
      return res.status(403).send('Forbidden');
    });
}

/**
 * Returns a jwt token signed by the app secret
 */
export function signToken(id, role, instituteId, hostname) {
  return jwt.sign(
    {
      _id: id,
      role,
      instituteId,
      hostname,
    },
    config.secrets.session,
    {
      expiresIn: 60 * 60 * 24,
    },
  );
}

/**
 * @author Gaurav Chauhan
 * @description Create and sign token containing user's access related details.
 */
export function signAccessControlToken(id, access) {
  return jwt.sign(
    {
      _id: id,
      access,
    },
    config.secrets.session,
    {
      expiresIn: 60 * 60 * 24,
    },
  );
}

/**
 * Set token cookie directly for oAuth strategies
 */
export function setTokenCookie(req, res) {
  if (!req.user) {
    return res
      .status(404)
      .send("It looks like you aren't logged in, please try again.");
  }
  const token = signToken(
    req.user._id, // eslint-disable-line
    req.user.role,
    req.user.instituteId,
    req.hostname,
  );
  res.cookie('token', token);
  return res.redirect('/');
}

/**
 * @author Gaurav Chauhan
 * @description Check if the user have admin prevelages or not.
 */
export function isAdmin() {
  return compose().use((req, res, next) => {
    const isSuperAdmin = req.user.access.roleName.includes('SUPER_ADMIN');
    return isSuperAdmin ? next() : res.status(403).end();
  });
}
