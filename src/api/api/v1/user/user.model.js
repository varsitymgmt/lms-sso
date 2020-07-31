/* eslint no-invalid-this:0 */
/* eslint-disable */
import crypto from 'crypto';
import mongoose, { Schema } from 'mongoose';
import { validateRoleId } from '../user/user.controller';

mongoose.Promise = require('bluebird');

// import {registerEvents} from './user.events';

function getRandomHash() {
  const rand = Math.random().toString(36).slice(2);
  return Buffer.from(rand).toString('base64');
}

const UserSchema = new Schema({
  name: String,
  email: {
    type: String,
    required: true,
  },
  role: {
    type: [String],
    default: [],
    required: true,
  },
  studentId: { type: String },
  password: {
    type: String,
    // required: true,
  },
  provider: String,
  salt: String,
  instituteId: {
    type: String,
    description: 'Institute Id of the given Institute',
    required: true,
  },
  hostname: { type: [String], default: null },
  otp: { type: String },
  forgotPassSecureHash: { type: String, default: '' },
  forgotPassSecureHashExp: { type: Date },
  passwordChange: { type: Boolean, default: true },
  userId: { type: String },
  username: {
    type: String,
    required: true,
    uppercase: true
  },
  dummy: { type: Boolean, default: false },
  imageUrl: { type: String },
  active: { type: Boolean, default: true },
  hierarchy: {
    type: [JSON],
    default: [],
    required: true,
  },
  orientations: { type: [JSON], default: [] },
  userType: { type: String },
  rawHierarchy: {
    type: JSON,
    default: [],
    required: true,
  },
  loginHash: {
    type: String,
    // default: getRandomHash,
  },
  contactNumber: {
    type: String,
  },
  activityLogs: {},
  wlsds: {type: Boolean, default: false} //white list single device sign in
},{
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
});

/**
 * Virtuals
 */

// Public profile information
UserSchema.virtual('profile').get(() => ({
  name: this.name,
  role: this.role,
}));

// Non-sensitive info we'll be putting in the token
UserSchema.virtual('token').get(() => ({
  _id: this._id,  // eslint-disable-line
  role: this.role,
}));

/**
 * Validations
 */

// Validate empty email
UserSchema.path('email').validate(
  email => email.length,
  'Email cannot be blank',
);
// Validate empty email
UserSchema.path('username').validate(
  username => username.length,
  'username cannot be blank',
);

// Validate empty password
UserSchema.path('password').validate(
  password => password.length,
  'Password cannot be blank',
);

// Validate empty instituteId
UserSchema.path('instituteId').validate(
  instituteId => instituteId.length,
  'instituteId cannot be blank',
);

// Validate empty hostname
UserSchema.path('hostname').validate(
  hostname => hostname.length,
  'hostname cannot be blank',
);

// Validate User Role
UserSchema.path('role').validate(async function roleValidation(role) {
  const context = {
    instituteId: this.instituteId,
  };
  const isValid = true;
  for (let i = 0; i < role.length; i += 1) {
    const isValidRole = await validateRoleId(role[i], context); // eslint-disable-line// eslint-disable-line
    if (isValidRole.err) {
      return false;
    }
  }
  return isValid;
}, 'Invalid Role name provided');

// // Validate email is not taken
// UserSchema.path('email').validate(function (value) {
//   const hostname = this.hostname
//   return this.constructor
//     .findOne({ email: value, active: true, hostname })
//     .exec()
//     .then(user => {
//       if (user) {
//         if (this.id === user.id) {
//           return true;
//         }
//         return false;
//       }
//       return true;
//     })
//     .catch(err => {
//       throw err;
//     });
// }, 'The specified email address is already in use.');


// // Validate userName is not taken
// UserSchema.path('username').validate(function (value) {
//   const hostname = this.hostname
//   return this.constructor
//     .findOne({ username: value, active: true, hostname })
//     .exec()
//     .then(user => {
//       if (user) {
//         if (this.id === user.id) {
//           return true;
//         }
//         return false;
//       }
//       return true;
//     })
//     .catch(err => {
//       throw err;
//     });
// }, 'The specified username is already in use.');

const validatePresenceOf = function (value) {
  return value && value.length;
};

/**
 * Pre-save hook
 */
UserSchema.pre('save', function (next) {
  // Handle new/update passwords

  if (!this.isModified('password')) {
    return next();
  }

  if (!validatePresenceOf(this.password)) {
    return next(new Error('Invalid password'));
  }

  // Make salt with a callback
  this.makeSalt((saltErr, salt) => {
    if (saltErr) {
      return next(saltErr);
    }
    this.salt = salt;
    this.encryptPassword(this.password, (encryptErr, hashedPassword) => {
      if (encryptErr) {
        return next(encryptErr);
      }
      this.password = hashedPassword;
      return next();
    });
  });
});

/**
 * Methods
 */
UserSchema.methods = {
  /**
   * Authenticate - check if the passwords are the same
   *
   * @param {String} password
   * @param {Function} callback
   * @return {Boolean}
   * @api public
   */
  authenticate(password, callback) {
    if (!callback) {
      return this.password === this.encryptPassword(password);
    }

    this.encryptPassword(password, (err, pwdGen) => {
      if (err) {
        return callback(err);
      }

      if (this.password === pwdGen) {
        return callback(null, true);
      }
      return callback(null, false);
    });
  },

  /**
   * Make salt
   *
   * @param {Number} [byteSize] - Optional salt byte size, default to 16
   * @param {Function} callback
   * @return {String}
   * @api public
   */
  makeSalt(...args) {
    let byteSize;
    let callback;
    const defaultByteSize = 16;

    if (typeof args[0] === 'function') {
      callback = args[0];
      byteSize = defaultByteSize;
    } else if (typeof args[1] === 'function') {
      callback = args[1];
    } else {
      throw new Error('Missing Callback');
    }

    if (!byteSize) {
      byteSize = defaultByteSize;
    }

    return crypto.randomBytes(byteSize, (err, salt) => {
      if (err) {
        return callback(err);
      }
      return callback(null, salt.toString('base64'));
    });
  },

  /**
   * Encrypt password
   *
   * @param {String} password
   * @param {Function} callback
   * @return {String}
   * @api public
   */
  encryptPassword(password, callback) {
    if (!password || !this.salt) {
      if (!callback) {
        return null;
      }
      return callback('Missing password or salt');
    }

    const defaultIterations = 10000;
    const defaultKeyLength = 64;
    const salt = new Buffer(this.salt, 'base64');

    if (!callback) {
      // eslint-disable-next-line no-sync
      return crypto
        .pbkdf2Sync(password, salt, defaultIterations, defaultKeyLength, 'sha1')
        .toString('base64');
    }

    return crypto.pbkdf2(
      password,
      salt,
      defaultIterations,
      defaultKeyLength,
      'sha1',
      (err, key) => {
        if (err) {
          return callback(err);
        }
        return callback(null, key.toString('base64'));
      },
    );
  },
};

export default mongoose.model('User', UserSchema);
