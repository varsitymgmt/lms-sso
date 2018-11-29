import express from 'express';
import { config } from '../../config/environment';
import User from '../api/v1/user/user.model';

import { isAuthenticated } from './auth.service';
// Passport Configuration
require('./local/passport').setup(User, config);

const router = express.Router();

router.use('/local', require('./local').default);

router.post('/isAuthenticated', isAuthenticated(), (req, res) =>
  res.send(req.user),
);
router.post('/token/health', isAuthenticated(false, true), (req, res) =>
  res.send(),
);

export default router;
