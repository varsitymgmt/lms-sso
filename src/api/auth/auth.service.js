import jwt from 'jsonwebtoken';

import expressJwt from 'express-jwt';
import compose from 'composable-middleware';
import { config } from '../../config/environment';

import User from '../api/v1/user/user.model';

const utf8 = require('utf8');

const CryptoJS = require('crypto-js');

const validateJwt = expressJwt({
  secret: config.secrets.session,
});

/**
 * @author Gaurav Chauhan
 * @description Verify and decode the access token provided,if invalid it reject the request.
 */
export function verifyJWTToken(token, userId) {
  if (config.encriptedToken) {
    const bytes = CryptoJS.AES.decrypt(
      token.toString(),
      config.encriptedTokenKey,
    );
    token = bytes.toString(CryptoJS.enc.Utf8);
  }
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
        const { authorization } = req.headers;
        if (config.encriptedToken) {
          const bytes = CryptoJS.AES.decrypt(
            authorization.toString(),
            config.encriptedTokenKey,
          );
          req.headers.authorization = bytes.toString(CryptoJS.enc.Utf8);
        }
        req.authorization = authorization;
        req.headers.authorization = `Bearer ${req.headers.authorization}`;
        validateJwt(req, res, next);
      })
      // Attach user to request
      .use((req, res, next) => {// eslint-disable-line
        if (!req.user || !req.user._id) {// eslint-disable-line
          res.statusMessage = 'User Data is Null';
          return res.status(401).end();
        }
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
            if (req.user.hostname !== user.hostname) {
              res.statusMessage = 'hostname does not Match';
              return res.status(401).end();
            }
            if (user.loginHash !== req.user.loginHash) {
              res.statusMessage = 'User need to Login again';
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
                const { authorization } = req;
                delete req.authorization;
                userData.token = {
                  authorization,
                  accesscontroltoken,
                };
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
// export function hasRole(roleRequired) {
//   if (!roleRequired) {
//     throw new Error('Required role needs to be set');
//   }
//
//   return compose()
//     .use(isAuthenticated())
//     .use((req, res, next) => {
//       if (
//         config.userRoles.indexOf(req.user.role) >=
//         config.userRoles.indexOf(roleRequired)
//       ) {
//         return next();
//       }
//       return res.status(403).send('Forbidden');
//     });
// }

/**
 * Returns a jwt token signed by the app secret
 */
export async function signToken(id, role, instituteId, hostname, loginHash) {
  let token = await jwt.sign(
    {
      _id: id,
      role,
      instituteId,
      hostname,
      loginHash,
    },
    config.secrets.session,
    {
      expiresIn: 60 * 60 * 24,
    },
  );
  if (config.encriptedToken) {
    token = await CryptoJS.AES.encrypt(
      token.toString(),
      config.encriptedTokenKey,
    ).toString();
  }
  return utf8.decode(token);
}

/**
 * @author Gaurav Chauhan
 * @description Create and sign token containing user's access related details.
 */
export async function signAccessControlToken(id, access) {
  let token = await jwt.sign(
    {
      _id: id,
      access,
    },
    config.secrets.session,
    {
      expiresIn: 60 * 60 * 24,
    },
  );
  if (config.encriptedToken) {
    token = await CryptoJS.AES.encrypt(
      token.toString(),
      config.encriptedTokenKey,
    ).toString();
  }
  return utf8.decode(token);
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
    req.user.loginHash,
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

/**
 * @author GAURAV CHAUHAN
 * @description This function is part of user management,
 *              and used for route blocking according to the api's requirement.
 * @param {String} systemRole  : System role from which you want to set Read/Write access
 * @param {Array} readOnlyRole : System role from which you want to set  ReadOnly access
 * @returns {function} It returns a function which take accessType
 *                    as input(read or write[taken from config]).
 * @example
 *    const can = hasRole(config.role.settings,[config.role.tests]) -> read/write access for setting
 *                and readOnly access for tests.
 *    app.use('/read',can(config.accessType.read),*) // setting and tests access to this api.
 *    app.use('/read',can(config.accessType.wite),*) // only setting access to this api.
 */
export function hasRole(systemRole, readOnlyRole = []) {
  return accessType => {
    if (!systemRole || !accessType) {
      throw new Error('Required systemRole/accessType needs to be set');
    }
    if (readOnlyRole.length) {
      readOnlyRole.forEach(role => {
        if (!config.systemRoles.includes(role)) {
          throw new Error('Invalid ReadOnly role');
        }
      });
    }
    if (!config.systemRoles.includes(systemRole)) {
      throw new Error('Invalid system-role');
    }
    return compose().use((req, res, next) => {
      const { access } = req.user;
      const canRead = access.read.find(x => x.name === systemRole);
      const canWrite = access.write.find(x => x.name === systemRole);
      if (accessType === config.accessType.read) {
        if (canRead) next();
        else {
          // Go to next if the request is from any of the readOnly modules
          let canReadOnly;
          for (let i = 0; i < readOnlyRole.length; i += 1) {
            canReadOnly = access.read.find(x => x.name === readOnlyRole[i]);
            if (canReadOnly) break;
          }
          if (canReadOnly) next();
          else res.status(403).end();
        }
      } else if (accessType === config.accessType.write && canWrite) next();
      else res.status(403).end();
    });
  };
}
