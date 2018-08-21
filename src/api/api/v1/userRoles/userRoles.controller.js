/**
 * @author Gaurav Chauhan
 * @description Controller for all the user role related api's.
 */
import _ from 'lodash';
import userRoles from './userRoles.model';
import { config } from '../../../../config/environment';

/* --------------------UTIL FUNCTIONS------------------------- */
// export async function checkIfRoleExist(role, instituteId) {
//   const query = {
//     roleName: { $in: role },
//     instituteId,
//     active: true,
//   };
//   const userCount = await userRoles.count(query);
//   return (userCount === role.length);
// }

function checkIfAdmin(roleName) {
  return roleName === 'SUPER_ADMIN'
    ? { msg: 'Roles for Super Admin cannot be updated' }
    : false;
}
/**
 * @description validate the access(read/write) data provided by the user.
 * @param accessData -> Array of System roles
 * @returns true/false depending on the result.
 */
function validateAccessData(accessData) {
  const { systemRoles } = config;
  for (let i = 0; i < accessData.length; i += 1) {
    if (!systemRoles.includes(accessData[i].name)) return false;
  }
  return true;
}
/**
 * @description validate all user Role related data provided by the user.
 * @param data -> JSON containing the userRole data provided by user.
 * @returns true/{err} depending on the result.
 */

function validateRoleData(data) {
  const { readAccess, writeAccess, roleName } = data;
  if (!roleName) return { err: 'Role name is mandatory' };
  const isAdmin = checkIfAdmin(roleName);
  if (isAdmin) return { err: isAdmin.msg };
  if (!readAccess || !writeAccess) return { err: 'Data provided is invalid.' };
  if (typeof readAccess !== 'object' || typeof writeAccess !== 'object') {
    return { err: 'Invalid data format' };
  }
  if (!validateAccessData(readAccess))
    return { err: 'Invalid read access data' };
  if (!validateAccessData(writeAccess))
    return { err: 'Invalid write access data' };
  return true;
}

function getMongoQuerry(instituteId, roleName) {
  const roleId = `${instituteId}_${roleName.toLowerCase()}`;
  const query = {
    roleId,
    active: true,
  };
  return query;
}
/**
 * @description Make a table of access details for the ease of frontend.
 * @param read -> Arrray of read Access.
 * @param write -> Arrray of write Access.
 * @returns JSON containing the proper access table.
 */

function getReadWriteRole(read, write) {
  const rw = {
    readAndWrite: [],
    read: [],
    write: [],
    none: [],
  };
  const { systemRoles } = config;
  const roleMap = {};
  // map all the system role to 0, curently they have no access.
  for (let i = 0; i < systemRoles.length; i += 1) {
    roleMap[systemRoles[i]] = 0;
  }
  // Add 2 to all the system role that have write access.
  for (let i = 0; i < read.length; i += 1) {
    roleMap[read[i].name] += 2;
  }

  // Add 3 to all the system role that have write access.
  for (let i = 0; i < write.length; i += 1) {
    roleMap[write[i].name] += 3;
  }
  /**
   * 5 -> have read and write access.
   * 3 -> have write access.
   * 2 -> have read access.
   * 0 -> have no access.
   */
  /* eslint-disable */
  for (const key in roleMap) {
    if (roleMap[key] === 5) rw.readAndWrite.push(key);
    if (roleMap[key] === 3) rw.write.push(key);
    if (roleMap[key] === 2) rw.read.push(key);
    if (roleMap[key] === 0) rw.none.push(key);
  }
  /* eslint-enable */
  return rw;
}

/**
 * Common callback function for update and delete
 */
function updateCallback(status) {
  if (status.n === 0) {
    return { status: 'FAILED', message: "Role doesn't exist in the system" };
  }
  if (status.nModified === 0) {
    return { status: 'FAILED', message: 'Something went wrong,try again' };
  }
  return { status: 'SUCCESS' };
}

/* --------------------CONTROLLER FUNCTIONS-------------------- */

/**
 * @description Controller to create a new role.
 * @param read -> Arrray of read Access.
 * @param write -> Arrray of write Access.
 * @returns status -> SUCCESS?FAILED.
 * @returns message -> if FAILED.
 * @returns data -> if SUCCESS: inserted data.
 */

export function createRole(args, context) {
  const isValid = validateRoleData(args);
  if (isValid.err) {
    return { status: 'FAILED', message: isValid.err };
  }
  const { readAccess, writeAccess, roleName } = args;
  const { instituteId } = context.user;
  const query = getMongoQuerry(instituteId, roleName);
  return userRoles.find(query).then(docs => {
    if (docs.length) {
      return { status: 'FAILED', message: 'Role already exist in the system' };
    }
    const dataToInsert = {
      roleId: query.roleId,
      roleName,
      instituteId,
      readAccess: _.uniqBy(readAccess, 'name'),
      writeAccess: _.uniqBy(writeAccess, 'name'),
    };
    return userRoles
      .create(dataToInsert)
      .then(newDocument => ({ status: 'SUCCESS', data: newDocument }))
      .catch(err => {
        console.error(err);
        return { status: 'FAILED', message: 'Something went wrong,try again' };
      });
  });
}

/**
 * @description Controller to create a new role.
 * @param read -> Arrray of read Access.
 * @param write -> Arrray of write Access.
 * @returns status -> SUCCESS?FAILED.
 * @returns message -> if FAILED.
 */

export function updateUserRoles(args, context) {
  const isValid = validateRoleData(args);
  if (isValid.err) {
    return { status: 'FAILED', message: isValid.err };
  }
  const { readAccess, writeAccess, roleName } = args;
  const { instituteId } = context.user;
  const query = getMongoQuerry(instituteId, roleName);
  const access = {
    readAccess: _.uniqBy(readAccess, 'name'),
    writeAccess: _.uniqBy(writeAccess, 'name'),
  };
  return userRoles.update(query, { $set: access }).then(updateCallback);
}

/**
 * @description Controller to create a new role.
 * @param read -> Arrray of read Access.
 * @param write -> Arrray of write Access.
 * @returns JSON -> containes table for read/write access.
 */

export function readRoles(args, context) {
  const query = {
    instituteId: context.user.instituteId,
    active: true,
  };
  if (args.roleName) {
    query.roleName = { $in: args.roleName };
  }
  return userRoles
    .find(query)
    .then(docs => {
      const Roles = [];
      docs.forEach(accessData => {
        const { roleName, roleId, readAccess, writeAccess } = accessData;
        const data = getReadWriteRole(readAccess, writeAccess);
        const role = {
          roleName,
          roleId,
          data,
        };
        Roles.push(role);
      });
      return Roles;
    })
    .catch(err => {
      console.error(err);
      return err;
    });
}

export function deleteUserRoles(args, context) {
  const { roleName } = args;
  const { instituteId } = context.user;

  const isAdmin = checkIfAdmin(roleName);
  if (isAdmin) {
    return { status: 'FAILED', message: isAdmin.msg };
  }

  const query = getMongoQuerry(instituteId, roleName);
  return userRoles
    .update(query, { $set: { active: false } })
    .then(updateCallback)
    .catch(err => {
      console.error(err);
      return { status: 'FAILED', message: 'Something went wrong,try again' };
    });
}
