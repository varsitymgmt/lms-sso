import express from 'express';
import passport from 'passport';
import {
  signToken,
  signAccessControlToken,
  isAuthenticated,
} from '../auth.service';
import userRoles from '../../api/v1/userRoles/userRoles.model';

const router = express.Router();

router.post(
  '/',
  // (req, res, next) => {
  //   User.find({ email:  }).then(docs => {
  //     console.info(docs);
  //     return res.send(docs);
  //   });
  // },
  (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
      const error = err || info;
      if (error) {
        return res.status(401).json(error);
      }
      if (!user) {
        return res
          .status(404)
          .json({ message: 'Something went wrong, please try again.' });
      }
      const token = signToken(
      user._id, // eslint-disable-line
        user.role,
        user.instituteId,
        user.hostname,
      );
      const userRoleQuery = {
        roleName: { $in: user.role },
        instituteId: user.instituteId,
        active: true,
      };
      if (!user.hierarchy) user.hierarchy = [];
      return userRoles
        .find(userRoleQuery)
        .then(docs => {
          const access = {
            roleName: [],
            read: [],
            write: [],
            hierarchy: user.hierarchy.map(x => x.childCode),
          };
          docs.forEach(role => {
            const { readAccess, writeAccess, roleName } = role;
            access.roleName.push(roleName);
            access.read.push(...readAccess);
            access.write.push(...writeAccess);
          });
        const accessControlToken = signAccessControlToken(user._id, access); // eslint-disable-line
          res.json({
            token,
            accessControlToken,
            firstTimePasswordChanged: user.passwordChange,
          });
        })
        .catch(err2 => {
          console.error(err2);
          return res
            .status(404)
            .json({ message: 'Something went wrong, please try again.' });
        });
    })(req, res, next);
  },
);
router.post('/refreshtoken', isAuthenticated(), (req, res) => {
  const { user } = req;
  const token = signToken(user._id, user.role, user.instituteId, user.hostname); // eslint-disable-line
  res.json({ token, firstTimePasswordChanged: user.passwordChange });
});

export default router;
