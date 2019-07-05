/* eslint-disable */
import jwt from 'jsonwebtoken';
import {map,find,forEach,pull} from 'lodash';
import User from './user.model';
import { config } from '../../../../config/environment';
import userRoles from '../userRoles/userRoles.model';
import { validateHierarchyData } from '../hierarchy/hierarchy.controller';
import { getRandomHash } from '../../../utils/index'
import _ from 'lodash';

const bcrypt = require('bcrypt');
const celery = require('celery-client');
const fetch = require('node-fetch');

const emailCtrl = require('../emailTransporter/emailTransporter.controller');
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';

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
    .then(async data => {
      args.rawHierarchy = args.hierarchy;
      args.hierarchy =  data;
      return true;
    })
    .catch(err => ({ err }));
}

export function logOutOnRoleChange(query){
    return User.updateMany(query,{'$set': {loginHash: getRandomHash()} })
    .then(data=>{status:"SUCCESS",data})
    .catch(err=>{
      console.error(err);
      return {status:"FAILED"}
    });
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
export async function validateRoleId(roleId, context) {
  if (!roleId) {
    return { err: 'Role is Mandatory' };
  }
  const { instituteId } = context;
  const query = {
    roleId,
    instituteId,
    active: true,
  };
  const docs = await userRoles.findOne(query);
  if (!docs) {
    return { err: 'Invalid Role provided' };
  }
  return true;
}

export async function validateRoleName(roleName, context) {
  if (!roleName) {
    return { err: 'Role Name is Mandatory' };
  }
  const { instituteId } = context;
  const query = {
    roleName,
    instituteId,
    active: true,
  };
  const docs = await userRoles.findOne(query);
  if (!docs) {
    return { err: 'Invalid Role Name provided' };
  }
  return docs.roleId;
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
  const roleId = [];
  for (let i = 0; i < roleName.length; i += 1) {
    const isValidRole = await validateRoleName(roleName[i], context);
    if (isValidRole.err) return isValidRole;
    roleId.push(isValidRole);
  }
  const isValidHierarchy = await validatedHierarchy(data, context);
  if (isValidHierarchy.err) {
    return isValidHierarchy;
  }
  return roleId;
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
          console.info('User Creation Task >', taskId);
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
            return res.json({ usersFound: true });
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
    email: req.body.email,
    instituteId: req.body.instituteId,
    hostname: req.body.hostname,
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
  const roleId = isValid;
  const { emails, hierarchy, rawHierarchy } = args;
  const doesUserExist = await checkUserinDb(emails, context);
  if (doesUserExist.err)
    return { status: 'FAILED', message: doesUserExist.err };
  const {token} = context.user;
  const celeryArgs = [emails, roleId, hierarchy, rawHierarchy, context.user,token];
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
  const roleId = isValid;
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
  return User.updateMany(query, { $set: { role: roleId, rawHierarchy, hierarchy, loginHash } })
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
  const role = await userRoles.find({'roleId':{$in:user.role}},{'_id':false,roleName:true}).lean();
  const isSuperAdmin = _.findIndex(role,x=>x.roleName===config.superAdmin) !== -1;

  if(isSuperAdmin){
    return { status: 'FAILED', message: `Cannot delete ${config.superAdmin}` };
  }
  return User.updateOne(query, { $set: { active: false } }).then(docs => {
    if (docs.n === 0)
      return { status: 'FAILED', message: 'Email does not exist' };
    if (docs.nModified === 0)
      return { status: 'FAILED', message: 'Something went wrong,try again' };
    return { status: 'SUCCESS' };
  });
}

export async function getUserList(args, context) {
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

  const userRolesQuery = {
    instituteId,
    visible:true,
    active:true
  }
  const userRolesList = await userRoles.find(userRolesQuery,{roleId:true,roleName:true,_id:false}).lean();
  const roleIds = {};
    await _.forEach(userRolesList,x=>
    roleIds[x.roleId] = x.roleName
  );
  query.role ={ $in:Object.keys(roleIds) };
  const projection= {username:true,role:true,email:true, hierarchy:true,rawHierarchy:true,_id:false};

  return User.find(query,projection).lean()
    .then(users => _.map(users,user=>{
      user.role = user.role.map(x=>roleIds[x]);
      return user;
    }))
    .catch(err => {
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
    if(!find(write,{name :config.role.settings})){
      return res.status(403).send({error:"User doesnot have write access"});
    }

    //null check for neccessary params
    const {usernameList,password} = req.body
    if(!usernameList || !usernameList[0] || !password){
      return res.status(400).send({error:"Incomplete Params. Please provide with a list of student username and a password to be set"});
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

export async function createStudentUser(req, res) {
  const obj = req.body && req.body.studentData ? req.body.studentData : {}
  const { user } = req;
  const userObj = {
    studenId: obj.studentId,
    username: obj.studentId,
    hierarchy: obj.hierarchy,
    rawHierarchy: obj.hierarchy,
    instituteId: user.instituteId,
    hostname: user.hostname,
    defaultHostname: user.hostname,
    role: config.studentRole,
    email: obj.studentId,
    passwordChange: true,
    contactNumber: obj.phone,
    active: obj.active,
  }
  return User.updateOne({ email: userObj.email }, {$set: userObj},{upsert: true }).then(() => {
    return res.send({ status: true })
  }).catch(err => {
    console.error(err);
    return res.send({ status: false })
  })
}

export async function chaitanyaAPI(payload) {
  const admission_no = payload.email;
  const url = `${config.smsApiUrl}&admission_no=${admission_no}&otp=${payload.otp}`
  return fetch(url)
  .then(res => {
    const resp = res.json();
    console.info(resp);
    return resp;
  })
  .catch(err => {
    console.log(err);
    return res.status(400).send('SMS service failure');
  })
  // return payload;
}

export async function sendOTP(req, res) {
  let email = req.body.email
  if (!email) {
    return res.status(403).send('Please send email');
  }
  const email_lower = email.toLowerCase();
  const email_upper = email.toUpperCase();  
  const saltRounds = 10;

  // Find if the given User email exists in the database.
  const userDetails = await User.findOne({email: { $in: [ email_lower, email_upper ]}, active: true }).lean();
  // If No users have been found with give email.
  if (!userDetails) {
    return res.status(404).send({
      usersFound: false,
      message: 'Invalid User',
    });
  } else {
    if(!userDetails.otp || Date.now() > userDetails.forgotPassSecureHashExp ) userDetails.otp = ""+Math.floor(1000 + Math.random() * 9000);
    const exp = Date.now() + 1000 * 60 * 15; // expiry time in ms
    const payload = {
      email,
      otp: userDetails.otp,
    };
    const toHash = email_lower + userDetails.otp;
    // If a valid user exists with the given email.
    // Generate a secure hash for a user to store in our db.
    bcrypt.hash(toHash, saltRounds, (err, hash) => {
      User.update(
        {
          email: { $in: [ email_lower, email_upper ]},
        },
        {
          $set: {
            forgotPassSecureHash: hash,
            forgotPassSecureHashExp: exp,
            otp: userDetails.otp,
          },
        },
        (err1, docs) => {
          if (docs) {
            return chaitanyaAPI(payload).then((obj) => {
              return res.send(obj);
            }).catch(err => {
              console.error(err);
              return res.status(404).end('Something went wrong')
            })
          }
          console.error(err1)
          return res.status(404).end('Something went wrong')
        },
      );
    });
  }
}

export async function verifyOTP(req, res) {
  let { email, otp } = req.body;
  if (!email) {
    return res.status(403).send('Please send email');
  }
  if (!otp) {
    return res.status(403).send('Please send otp');
  }
  const email_lower = email.toLowerCase();
  const email_upper = email.toUpperCase();  
  otp = ""+otp;
  // Find if the given User email exists in the database.
  const userDetails = await User.findOne({email: { $in: [ email_lower, email_upper ]}, active: true }, {email: 1, forgotPassSecureHash: 1,  forgotPassSecureHashExp: 1
  });
  // If No users have been found with give email.
  if (!userDetails) {
    res.status(404).send({
      success: false,
      hashToken: null,
      userFound: false,
      message: "Invalid User"
    });
  } else {
    const toHash = email_lower + otp;
    bcrypt.compare(toHash, userDetails.forgotPassSecureHash).then(match => {
      if (Date.now() > userDetails.forgotPassSecureHashExp) {
        return res.status(200).send({
          success: false,
          hashToken: null,
          userFound: true,
          message: "Session expired"
        });
      }  
      if(match) {
        return res.status(200).send({
          success: true,
          userFound: true,
          hashToken: userDetails.forgotPassSecureHash,
          message: "OTP matched"
        });
      } else {
        return res.status(200).send({
          success: false,
          hashToken: null,
          userFound: true,
          message: "Invalid OTP"
        });
      }
    });
  }
}
// function to reset password using forgethashtoken and new password
export async function resetpassword(req, res) {
  const { hashToken, newPassword } = req.body;
  if (hashToken && newPassword) {
    if (newPassword.length !== 4 || !/[0-9]{4}/.test(newPassword)) {
      return res.status(403).send('Password must be 4 digits only');
    }
    return User.findOneAndUpdate({
      forgotPassSecureHash: hashToken,
      active: true
    },
    { $set: { forgotPassSecureHash : '', otp: '' } }
    )
      .then(user => {
        if(!user) return res.status(403).end('invalid hashToken')
        if (Date.now() <= user.forgotPassSecureHashExp) {
          user.password = newPassword;
          delete user.forgotPassSecureHash;
          delete user.otp;
          return user
            .save()
            .then(() => {
              res.status(200).end('Password changed successfully!');
            })
            .catch(validationError(res));
        }

        return res.status(403).send('Session expired');
      })
      .catch((err) => {
        console.log(err)
        res.status(403).end()
      });
  }

  return res.status(403).send(' hashToken, newPassword required');
}


