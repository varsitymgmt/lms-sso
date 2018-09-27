/* eslint-disable */
import jwt from 'jsonwebtoken';
import {map,find,forEach,pull} from 'lodash';
import User from './user.model';
import { config } from '../../../../config/environment';
import userRoles from '../userRoles/userRoles.model';
import { validateHierarchyData } from '../hierarchy/hierarchy.controller';

const bcrypt = require('bcrypt');
const celery = require('celery-client');

const emailCtrl = require('../emailTransporter/emailTransporter.controller');

export async function updateAdminHierarchy(req,res) {
    const {hierarchy} = req.body;
    const { instituteId, email } = req.user;
    const query = {
    instituteId,
    email,
    active: true,
    };
    return User.update(query, { $set:{ hierarchy } })
      .then((status) => {
      return res.send({ status: 'SUCCESS' });
      })
      .catch(err => res.send({ status: 'FAILED', message: err }));
}

async function validatedHierarchy(args, context) {
  return validateHierarchyData(args, context)
    .then(data => {
      args.rawHierarchy = args.hierarchy
      args.hierarchy = data;
      return true;
    })
    .catch(err => ({ err }));
}

function getRandomHash(){
  const rand = Math.random().toString(36).slice(2);
  return Buffer.from(rand).toString('base64');
}
/**
 * @author Gaurav Chauhan
 * @param {*} emails _> emails to search in db
 * @param {*} context -> user context
 * @param {true} sholudExist if true-> it throws error when user does not exist.
 * @param {false} sholudExist if false-> it throws error when user exist.
 */

async function checkUserinDb(emails, context, sholudExist = false) {
  const { instituteId } = context.user;
  const query = {
    email: { $in: emails },
    instituteId,
    active: true,
  };
  return User.find(query, {
    email: true,
    _id: false,
    role: true,
  }).then(docs => {
    const emailList = [];
    docs.forEach(({ email }) => emailList.push(email));
    if (!sholudExist) {
      return emailList.length !== 0
        ? { err: `Users already exist for : ${emailList.join(' , ')}` }
        : true;
    }
    const isSuperAdmin = docs.filter(x => x.role.includes(config.superAdmin));
    if (isSuperAdmin && isSuperAdmin.length > 0) {
      return {
        err: `Role of a admin ${isSuperAdmin[0].email} cannot be updated`,
      };
    }
    const dbEmails = docs.map(x => x.email);
    // find the difference between dbEmails and emails
    const difference = emails.filter(x => !dbEmails.includes(x));
    if (difference.length > 0)
      return {
        err: `User with email : ${difference.join(
          ' , ',
        )} | doesn't exist,please check and try again`,
      };
    return true;
  });
}
export async function validateRoleName(roleName, context) {
  if (!roleName) {
    return { err: 'Role Name is Mandatory' };
  }
  const { instituteId } = context;
  const roleId = `${instituteId}_${roleName.toLowerCase()}`;
  const query = {
    roleId,
    roleName,
    active: true,
  };
  const docs = await userRoles.findOne(query);
  if (!docs) {
    return { err: 'Invalid Role Name provided' };
  }
  return true;
}
async function validateUsersData(data, context) {
  const { emails, roleName } = data;
  const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
  const invalidEmail = [];
  if (!emails) {
    return { err: 'No email ids provided' };
  }
  for (let i = 0; i < emails.length; i += 1) {
    const isValidEmail = emailRegex.test(emails[i]);
    if (!isValidEmail) invalidEmail.push(emails[i]);
  }
  if (invalidEmail.length !== 0) {
    return { err: `Invalid emails : ${invalidEmail.join(' , ')}` };
  }
  if (roleName.includes(config.superAdmin)) {
    return {
      err: `${config.superAdmin} is a reserved role,it cannot be assigned to other users`,
    };
  }
  for (let i = 0; i < roleName.length; i += 1) {
    const isValidRole = await validateRoleName(roleName[i], context);
    if (isValidRole.err) return isValidRole;
  }
  const isValidHierarchy = await validatedHierarchy(data, context);
  if (isValidHierarchy.err) {
    return isValidHierarchy;
  }
  return true;
}

function validationError(res, statusCode) {
  statusCode = statusCode || 422;
  return function(err) {
    return res.status(statusCode).json(err);
  };
}

function handleError(res, statusCode) {
  statusCode = statusCode || 500;
  return function(err) {
    return res.status(statusCode).send(err);
  };
}
/**
 * @param {name of the task to register } taskName
 * @param {arguments for that celery task } args
 */
async function registerCeleryTask(args) {
  return new Promise(resolve => {
    try {
      const taskName = config.celeryTask.createUserTask;
      const broker = new celery.RedisHandler(config.celery.CELERY_BROKER_URL);
      const backend = new celery.RedisHandler(
        config.celery.CELERY_RESULT_BACKEND,
      );
      const celeryClient = new celery.Client(broker, backend);
      const kwargs = {};
      const taskOptions = {
        eta: Date.now(),
        retries: 3,
        queue: config.celery.QUEUE_NS,
      };
      celeryClient.putTask(
        `app.${taskName}`,
        args,
        kwargs,
        taskOptions,
        (err, taskId) => {
          if (err) {
            console.error(err);
            return resolve({ err: 'Unable to create students.' });
          }
          console.info('Sync Tests Task >', taskId);
          return resolve({ msg: 'User ceation started' });
        },
        (err, celeryResult) => {
          if (err) {
            console.error(err);
          }
          console.info('Result >', celeryResult);
        },
      );
    } catch (err) {
      console.error(err);
      return resolve({ err: 'something went wrong' });
    }
  });
}

// function to send emails for reset links
function sendEmail(usrDetails, hashValue, baseUrl) {
  const url = `${baseUrl}/resetPassword?token=${hashValue}`;
  const from = 'support@egnify.com'; // From address
  const to = usrDetails.email; // To address
  const subject = 'Egnify Password Reset'; // Subject
  const html = `Hi ${usrDetails.username},<br /> <br />
  You have recently asked for a password reset for your account with Egnify.<br />
  To update your password, please click on the button below:
  <br />
  <button style="margin-top:20px;height:50px; width:160px;border-radius:25px;border: 0;background-color:#cf6387"><a href=${url} style="color:black;text-decoration: none;color:white;font-size: 14px;"
  >RESET PASSWORD</a></button>
  <br /> <br />Best,<br />
  Team Egnify`;
  emailCtrl.sendEmail(from, to, subject, html);
}

function validateEmail(email) {
  const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
  return emailRegex.test(email);
}

// function to reset password using forgethashtoken and new password
export async function resetpassword(req, res) {
  const { hashToken } = req.body;
  const newPassword = req.body.password;
  if (hashToken && newPassword) {
    return User.findOne({
      forgotPassSecureHash: hashToken,
    })
      .then(user => {
        if (Date.now() <= user.forgotPassSecureHashExp) {
          user.password = newPassword;
          user.forgotPassSecureHash = '';
          return user
            .save()
            .then(() => {
              res.status(200).end();
            })
            .catch(validationError(res));
        }

        return res.status(403).send('Link Expired');
      })
      .catch(() => res.status(403).end());
  }

  return res.status(403).send('Invalid Parameter');
}

// function to validate forgethashtoken
export async function validateForgotPassSecureHash(req, res) {
  const { hashToken } = req.body;
  if (hashToken) {
    return User.findOne({
      forgotPassSecureHash: hashToken,
    })
      .then(user => {
        if (user) {
          if (Date.now() <= user.forgotPassSecureHashExp) {
            return res.status(200).json({ msg: 'Link Valid', isValid: true });
          }
          return res.status(403).json({ msg: 'Link Expired', isValid: false });
        }
        return res
          .status(403)
          .json({ msg: 'Not a Valid Hash', isValid: false });
      })
      .catch(err => {
        res.status(403).json({ msg: err, isValid: false });
      });
  }

  return res.status(403).json({ msg: 'Invalid Arguments', isValid: false });
}

// function to send reset link for the password
export async function sendResetLink(req, res) {
  const Email = req.body.email;
  const baseUrl = req.body.hostname;
  if (!Email || !baseUrl) {
    return res.status(403).send('Invalid Arguments');
  }
  const saltRounds = 10;

  // Find if the given User email exists in the database.
  const usrDetails = await User.find({ email: Email });
  // If No users have been found with give email.
  if (usrDetails.length === 0) {
    res.json({
      usersFound: false,
      hash: null,
    });
  } else {
    // If a valid user exists with the given email.
    const payload = {
      usrDetails,
      iat: Date.now(),
      exp: Date.now() + 1000 * 60 * 60 * 24, // time in ms
    };
    // Generate a secure hash to give user access to reset his password.
    bcrypt.hash(JSON.stringify(payload), saltRounds, (err, hash) => {
      User.update(
        {
          email: usrDetails[0].email,
        },
        {
          $set: {
            forgotPassSecureHash: hash,
            forgotPassSecureHashExp: payload.exp,
          },
        },
        (err1, docs) => {
          if (docs) {
            sendEmail(usrDetails[0], hash, baseUrl);
            return res.json({ usersFound: true, hash });
          }
          if (err1) console.error(err1);
        },
      );
    });
  }
}

/**
 * Get list of users
 * restriction: 'admin'
 */
export function index(req, res) {
  return User.find({}, '-salt -password')
    .exec()
    .then(users => res.status(200).json(users))
    .catch(handleError(res));
}

/**
 * @description Add user to database
 * @param {*} req
 * @param {*} res
 */
function addUser(req, res) {
  const query = {
    email: req.email,
    instituteId: req.body.instituteId,
    active: true,
  };
  User.find(query).then(docs => {
    if (docs.length !== 0) {
      return res.status(400).send({ err: 'User Already Exist' });
    }
    const newUser = new User(req.body);
    newUser.provider = 'local';
    newUser.role = req.body.role;
    return newUser
      .save()
      .then(user => {
        const token = jwt.sign(
          {
            _id: user._id,
            instituteId: user.instituteId,
            hostname: user.hostname,
          },
          config.secrets.session,
          {
            expiresIn: 60 * 60 * 5,
          },
        );
        return res.json({ token });
      })
      .catch(validationError(res));
  });
}
/**
 * @description Add a new user-> can be done only by the super admin
 */
export function create(req, res) {
  if (req.body.role && req.body.role.includes(config.superAdmin)) {
    return res
      .status(400)
      .send({
        err: `${config.superAdmin} is a reserved role,it cannot be assigned to other users`,
      });
  }
  return addUser(req, res);
}

/**
 * @description Create SUPER_ADMIN for a institute
 */
export async function createAdmin(req, res) {
  req.body.role = [config.superAdmin];
  const query = {
    role: config.superAdmin,
    instituteId: req.body.instituteId,
    active: true,
  };
  const usrDetails = await User.find(query);
  if (usrDetails.length === 0) {
    req.body.hierarchy = [];
    return addUser(req, res);
  }
  return res
    .status(400)
    .send({ err: `Super Admin already exist for ${req.body.instituteId}` });
}

/**
 * @description middleware by which admin can create multiple users and assign role
*               (off tasked to celery)
 * @author  Gaurav Chauhan
 * @augments  req.body
 *    @param  email(Array)
 *    @param  roleId
 *    @param  hierarchy
 * @returns
 *     user creation has been started.
*/
export async function registerUsers(args, context) {
  const isValid = await validateUsersData(args, context.user);
  if (isValid.err) {
    return { status: 'FAILED', message: isValid.err };
  }
  const { emails, roleName,hierarchy,rawHierarchy } = args;
  const doesUserExist = await checkUserinDb(emails, context);
  if (doesUserExist.err)
    return { status: 'FAILED', message: doesUserExist.err };
  const {token} = context.user;
  const celeryArgs = [emails, roleName,hierarchy,rawHierarchy, context.user,token];
  let returnData = {};
  return registerCeleryTask(celeryArgs).then(status => {
    if (status.err) {
      returnData = { status: 'FAILED', message: status.err };
    }
    returnData = { status: 'SUCCESS', message: status.msg };
    return returnData;
  });
}

/**
 * @description Update user's role/hierarchy
 * @author  Gaurav Chauhan
 * @returns
 *     status.
*/
export async function updateUsers(args, context) {
  const rawHierarchy = args.hierarchy;
  const isValid = await validateUsersData(args, context.user);
  if (isValid.err) {
    return { status: 'FAILED', message: isValid.err };
  }
  const { emails, roleName, hierarchy } = args;

  const doesUserNotExist = await checkUserinDb(emails, context, true);
  if (doesUserNotExist.err)
    return { status: 'FAILED', message: doesUserNotExist.err };
  const { instituteId } = context.user;
  const query = {
    email: { $in: emails },
    instituteId,
    active: true,
  };
  const loginHash =await getRandomHash();
  return User.updateMany(query, { $set: { role: roleName, rawHierarchy, hierarchy, loginHash } })
    .then(status => ({
      status: 'SUCCESS',
      message: `${status.n} users updated successfully`,
    }))
    .catch(err => {
      console.error(err);
      return { status: 'FAILED', message: 'Something went wrong' };
    });
}

/**
 * @description Remove the user from db (active:false)
 * @author  Gaurav Chauhan
 * @augments  req.body
 *    @param  email
 * @returns
 *     status.
*/
export async function removeUser(args, context) {
  // can remove using email or username
  const { email,username } = args;
  if (!email && !username) {
    return { status: 'FAILED', message: 'No email ids provided' };
  }
  if (!username && !validateEmail(email)) {
    return { status: 'FAILED', message: 'Invalid email id provided' };
  }
  const query = {
    $or: [
      {
        email,
      },
      {
        username,
      },
    ],
    instituteId: context.user.instituteId,
    active: true,
  };
  const user = await User.findOne(query);
  if(!user){
    return { status: 'FAILED', message: 'Email does not exist' };
  }
  // Reject requests to remove SUPER_ADMIN
  const {role} = user;
  if(role.includes(config.superAdmin)){
    return { status: 'FAILED', message: 'Cannot delete SUPER_ADMIN' };
  }
  return User.updateOne(query, { $set: { active: false } }).then(docs => {
    if (docs.n === 0)
      return { status: 'FAILED', message: 'Email does not exist' };
    if (docs.nModified === 0)
      return { status: 'FAILED', message: 'Something went wrong,try again' };
    return { status: 'SUCCESS' };
  });
}

export function getUserList(args, context) {
  const { instituteId } = context.user;
  const { emails } = args;
  const query = {
    instituteId,
    active: true,
  };
  if (emails) {
    const invalidEmail = [];
    for (let i = 0; i < emails.length; i += 1) {
      const email = emails[i];
      if (!validateEmail(email)) invalidEmail.push(email);
    }
    if (invalidEmail.length > 0) {
      return {
        status: 'FAILED',
        message: `Invalid Email ${invalidEmail.length === 1
          ? "'s"
          : ''} provided:${invalidEmail.join(' , ')}`,
      };
    }

    query.email = {'$in':emails};
  }

  return User.find(query).then(users => users).catch(err => {
    console.error(err);
    return { status: 'FAILED', message: 'Something went wrong' };
  });
}

/**
 * Get a single user
 */
export function show(req, res, next) {
  const userId = req.params.id;

  return User.findById(userId)
    .exec()
    .then(user => {
      if (!user) {
        return res.status(404).end();
      }
      return res.json(user.profile);
    })
    .catch(err => next(err));
}

/**
 * Deletes a user
 * restriction: 'admin'
 */
export function destroy(req, res) {
  return User.findByIdAndRemove(req.params.id)
    .exec()
    .then(() => res.status(204).end())
    .catch(handleError(res));
}

/**
 * Change a users Name
 */
export function changeUsername(req, res) {
  const userId = req.user._id;
  const { userName } = req.body;

  if (userName) {
    return User.findById(userId).exec().then(user => {
      if (user) {
        user.name = userName;
        return user
          .save()
          .then(() => res.status(204).end())
          .catch(validationError(res));
      }
      return res.status(403).end();
    });
  }
  res.statusMessage = 'No UserName in Request Parameter';
  return res.status(404).end();
}
/**
 * Change a users password
 */
export function changePassword(req, res) {
  const userId = req.user._id;
  const oldPass = String(req.body.oldPassword);
  const newPass = String(req.body.newPassword);

  return User.findById(userId).exec().then(user => {
    if (user.authenticate(oldPass)) {
      user.password = newPass;
      if (!user.passwordChange) {
        user.passwordChange = true;
      }
      return user
        .save()
        .then(() => {
          res.status(200).end();
        })
        .catch(validationError(res));
    }
    res.statusMessage = 'Current password does not match';
    return res.status(403).send('Current password does not match');
  });
}

/**
 * Get my info
 */
export function me(req, res, next) {
  // eslint-disable-next-line no-alert
  const userId = req.user._id;

  return User.findOne({ _id: userId }, '-salt -password')
    .exec()
    .then(user => {
      // don't ever give out the password or salt
      if (!user) {
        return res.status(401).end();
      }
      return res.json(user);
    })
    .catch(err => next(err));
}

/**
 * Authentication callback
 */
export function authCallback(req, res) {
  res.redirect('/');
}

//function to create Student users
export async function createStudents(req,res){
  try{
    addUser(req,res);
  }
  catch(error){
    console.error(error);
    res.status.send({status:"Unknown Error",message:error})
  }
}
//function to delete Student users
export async function deleteStudents(req,res){
  try {
    const args = req.body;
    const context = {user:req.user};
    const {status,message} = await removeUser(args,context);
    switch (status) {
      case 'SUCCESS':res.status(200).send({status})
        break;
      case 'FAILED': res.status(404).send({status,message})
        break;
      default: throw new Error("Unknown Status");
      }

  }
  catch(error){
    console.error(error);
    res.status(404).send({
      status:"Unknown Error",
      message:error,
    })
  }

}




/**
 * resetStudentPassword - function to reset password for students
 *
 * @param  {type} req description
 * @param  {type} res description
 * @return {type}     description
 */
export async function resetStudentPassword(req,res){
  try{
    const context = req.user
    if(!context){
     return res.status(404).send({error:"User Context Not Found"});
    }
    const {instituteId,access} = context;
    const {write} = access;
    //check if the user has write access in settings
    if(!find(write,{name :config.systemRolesObject.settings})){
      return res.status(403).send({error:"User doesnot have write access"});
    }

    //null check for neccessary params
    const {usernameList,password} = req.body
    if(!usernameList || !usernameList[0] || !password){
      return res.status(404).send({error:"Incomplete Params. Please provide with a list of student username and a password to be set"});
    }
    const query = {
      active: true,
      instituteId,
      username:{$in:usernameList}
    }
    // error codes
    const errorList = {
      studentUserError : {
        error: "User is not a Student",
        data : []
      },
      userNotFoundError: {
        error: "User Not Found",
        data : usernameList,
      },
      dbInsertError: {
        error: "Something went wrong while inserting in DB",
        data:[]
      }

    }

    User.find(query)
    .then(async(userList)=>{
      return Promise.all(userList.map(async(user)=>{
        const {username }= user;
        if(!user.role.includes(config.userRoles.student)){
           errorList.studentUserError.data.push(username);
           return "null";
        }
        user.password = password;
        //TODO: Change this to false when forced password reset is complete
        user.passwordChange = true;
        const updatedUser = await user.save();
        if(!updatedUser.username){
          errorList.dbInsertError.data.push(username);
        }
        pull(errorList.userNotFoundError.data,username);
        return username;

      }));
    })
    .then(successUserList=>{

      const data = {
        data:pull(successUserList,"null"),
        errorList:{},
      }
      forEach(errorList,(errorValue,error)=>{
        if(errorValue.data[0]){
          data.errorList[`${error}`]= errorValue
        }
      })
      return res.send(data);
    })
    .catch((err)=>{
      console.info(err)
      const data = {
        data:null,
        errorList:{},
      }
      forEach(errorList,(errorValue,error)=>{
        if(errorValue.data[0]){
          data.errorList[`${error}`]= errorValue
        }
      })
      return res.send(data);
    });

  }catch(err){
    console.error(err);
    res.status(404).send({
      status:"Error",
      message:err,
    })
  }
}
