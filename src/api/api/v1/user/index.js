import { Router } from 'express';
import * as controller from './user.controller';
import * as auth from '../../../auth/auth.service';
import { config } from '../../../../config/environment';

const router = new Router();
const can = auth.hasRole(config.role.settings);

// router.get('/', auth.hasRole('admin'), controller.index);
// router.delete('/:id', auth.hasRole('admin'), controller.destroy);
router.get('/me', auth.isAuthenticated(), controller.me);
router.put('/password', auth.isAuthenticated(true), controller.changePassword);
router.put('/:id/username', auth.isAuthenticated(), controller.changeUsername);
router.get('/:id', auth.isAuthenticated(), controller.show);
// router.post('/register/users', auth.isAuthenticated(), auth.isAdmin(), controller.registerUsers);
router.post('/resetpassword', controller.resetpassword);
router.post('/sendResetLink', controller.sendResetLink);
router.post(
  '/validateForgotPassSecureHash',
  controller.validateForgotPassSecureHash,
);
router.post('/createAdmin', controller.createAdmin);
router.post(
  '/admin/create/user',
  auth.isAuthenticated(),
  auth.isAdmin(),
  controller.create,
);
router.post(
  '/admin/update/hierarchy',
  auth.isAuthenticated(),
  auth.isAdmin(),
  controller.updateAdminHierarchy,
);
// routes to create and delete students
router.post(
  '/create/students',
  auth.isAuthenticated(),
  controller.createStudents,
);
router.post(
  '/delete/students',
  auth.isAuthenticated(),
  controller.deleteStudents,
);
router.post(
  '/resetpassword/students',
  auth.isAuthenticated(),
  can(config.accessType.write),
  controller.resetStudentPassword,
);

router.post(
  '/create/studentUser',
  auth.isAuthenticated(),
  controller.createStudentUser,
);

router.post('/sendOTP', controller.sendOTP);
router.post('/verifyOTP', controller.verifyOTP);

router.post(
  '/updateActivityLogs',
  auth.isAuthenticated(),
  controller.updateActivityLogs,
);

router.post(
  '/getActivityLogs',
  auth.isAuthenticated(),
  controller.getActivityLogs,
);

router.post(
  '/getActiveStudents',
  auth.isAuthenticated(),
  controller.getActiveStudents,
);
export default router;
