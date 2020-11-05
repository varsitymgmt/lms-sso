import { createStudentUser } from '../user/user.controller';

const express = require('express');

const router = express.Router();

router.post('/student/create-user', createStudentUser);

export default router;
