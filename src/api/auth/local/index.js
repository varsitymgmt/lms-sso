import express from 'express';
import passport from 'passport';
import {
  signToken,
  signAccessControlToken,
  isAuthenticated,
} from '../auth.service';
import userRoles from '../../api/v1/userRoles/userRoles.model';

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
/* -------------------------------API ROUTES------------------------------------*/

router.post('/', (req, res, next) => {
  passport.authenticate('local', async (err, user, info) => {
    const error = err || info;
    if (error) {
      return res.status(401).json(error);
    }
    if (!user) {
      return res
        .status(404)
        .json({ message: 'Something went wrong, please try again.' });
    }
    const token = await signToken(
      user._id, // eslint-disable-line
      user.role,
      user.instituteId,
      user.hostname,
      user.loginHash,
    );
    const { accessControlToken, status, message } = await getAccessControlToken(
      user,
    );
    if (!accessControlToken) {
      res.statusMessage = message;
      return res.status(status).end();
    }
    return res.json({
      token,
      accessControlToken,
      firstTimePasswordChanged: user.passwordChange,
    });
  })(req, res, next);
});

router.post('/refreshtoken', isAuthenticated(false, true), async (req, res) => {
  const { user } = req;
  const token = await signToken(user._id, user.role, user.instituteId, user.hostname,user.loginHash); // eslint-disable-line
  const { accessControlToken, status, message } = await getAccessControlToken(
    user,
  );
  if (!accessControlToken) {
    res.statusMessage = message;
    return res.status(status).end();
  }
  return res.json({
    token,
    accessControlToken,
    firstTimePasswordChanged: user.passwordChange,
  });
});

export default router;
