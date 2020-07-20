import express from 'express';
import passport from 'passport';

import {
  signToken,
  signAccessControlToken,
  isAuthenticated,
} from '../auth.service';
import userRoles from '../../api/v1/userRoles/userRoles.model';

const redisClient = require('../../../redis');

const router = express.Router();

/* ------------------------------UTIL FUNCTION----------------------------------*/
function getAccessControlToken(user) {
  const userRoleQuery = {
    roleId: { $in: user.role },
    instituteId: user.instituteId,
    active: true,
  };
  if (!user.hierarchy) user.hierarchy = [];
  return userRoles
    .find(userRoleQuery)
    .then(async docs => {
      const access = {
        roleName: [],
        read: [],
        write: [],
      };
      docs.forEach(role => {
        const { readAccess, writeAccess, roleName } = role;
        access.roleName.push(roleName);
        access.read.push(...readAccess);
        access.write.push(...writeAccess);
      });
      const accessControlToken = await signAccessControlToken(user._id, access); // eslint-disable-line
    return {accessControlToken}; // eslint-disable-line
    })
    .catch(err2 => {
      console.error(err2);
      return {
        status: 500,
        message: 'Something went wrong, please try again.',
      };
    });
}

export function getAsync(userId) {
  return new Promise((resolve, reject) => {
    redisClient.get(userId, (err, reply) => {
      if (err) {
        reject(err);
      }
      resolve(reply);
    });
  });
}

function setAsync(key, value, ttl) {
  return new Promise((resolve, reject) => {
    redisClient.set(key, value, 'EX', ttl, (err, reply) => {
      if (err) {
        reject(err);
      }
      resolve(reply);
    });
  });
}

function delAsync(key) {
  return new Promise((resolve, reject) => {
    redisClient.del(key, (err, reply) => {
      if (err) {
        reject(err);
      }
      resolve(reply);
    });
  });
}
/* -------------------------------API ROUTES------------------------------------*/

router.post('/', (req, res, next) => {
  const forceLogin = req.body.forceLogin || false;
  passport.authenticate('local', async (err, user, info) => {
    try {
      const error = err || info;
      if (error) {
        return res.status(401).json(error);
      }
      if (!user) {
        return res
          .status(404)
          .json({ message: 'Something went wrong, please try again.' });
      }
      const userId = user._id.toString(); // eslint-disable-line

      if (!forceLogin) {
        let loginInfo = await getAsync(userId);
        if (loginInfo) {
          loginInfo = JSON.parse(loginInfo);
          return res.status(409).send({
            message:
              "You're already logged in to RankGuru with another device/client. Please log out to access through this device.",
            deviceType: loginInfo.device_type,
            deviceName: loginInfo.device_name,
            ipInfo: loginInfo.ip_info,
          });
        }
      }
      const token = await signToken(
        user._id, // eslint-disable-line
        user.role,
        user.instituteId,
        user.hostname,
        user.loginHash,
      );
      const {
        accessControlToken,
        status,
        message,
      } = await getAccessControlToken(user);

      if (!accessControlToken) {
        res.statusMessage = message;
        return res.status(status).end();
      }
      const returnJson = {
        token,
        accessControlToken,
        firstTimePasswordChanged: user.passwordChange,
        redirectionLink: `https://${user.hostname}`,
      };
      await setAsync(userId, token, 86400);
      return res.json(returnJson);
    } catch (error) {
      console.error(error);
      return res.status(500).send('internal server error.');
    }
  })(req, res, next);
});

router.post('/refreshtoken', isAuthenticated(false, true), async (req, res) => {
  const { user } = req;
  const userId = user._id; //eslint-disable-line
  const token = await signToken(user._id, user.role, user.instituteId, user.hostname,user.loginHash); // eslint-disable-line
  const { accessControlToken, status, message } = await getAccessControlToken(
    user,
  );
  if (!accessControlToken) {
    res.statusMessage = message;
    return res.status(status).end();
  }
  await setAsync(userId, token, 86400);
  return res.json({
    token,
    accessControlToken,
    firstTimePasswordChanged: user.passwordChange,
  });
});

router.post('/logout', isAuthenticated(), async (req, res) => {
  try {
    await delAsync(req.user._id) //eslint-disable-line
    return res.status(200).end();
  } catch (err) {
    console.error(err);
    return res.status(500).send('internal server error');
  }
});

export default router;
