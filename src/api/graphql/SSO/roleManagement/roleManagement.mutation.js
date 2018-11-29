import {
  GraphQLList as List,
  GraphQLNonNull as NonNull,
  GraphQLString as StringType,
  GraphQLInputObjectType as InputObjectType,
  GraphQLObjectType as ObjectType,
  GraphQLEnumType,
} from 'graphql';

// import GraphQLJSON from 'graphql-type-json';

import { config } from '../../../../config/environment';
import {
  createRole,
  updateUserRoles,
  deleteUserRoles,
} from '../../../api/v1/userRoles/userRoles.controller';

import {
  registerUsers,
  removeUser,
  updateUsers,
} from '../../../api/v1/user/user.controller';

import { InputHierarchyType } from './roleManagement.type';

// console.info(config.graphqlSystemRolesEnum)
// --------------------------------------------TYPES-----------------------------------------------
const SystemRoles = new GraphQLEnumType({
  name: 'SystemRoles',
  values: config.graphqlSystemRolesEnum,
});
const SystemRoleType = new InputObjectType({
  name: 'SystemRoleType',
  fields: {
    name: { type: new NonNull(SystemRoles), description: 'System Role name' },
  },
});

const SystemRoleOutputType = new ObjectType({
  name: 'SystemRoleOutputType',
  fields: {
    name: { type: new NonNull(SystemRoles), description: 'System Role name' },
  },
});
const UserRoleType = new ObjectType({
  name: 'UserRoleType',
  fields: {
    roleName: { type: StringType, description: 'Role name is required' },
    readAccess: {
      type: new List(SystemRoleOutputType),
      description: 'Array of system roles',
    },
    writeAccess: {
      type: new List(SystemRoleOutputType),
      description: 'Array of system roles',
    },
  },
});
const CreateResultType = new ObjectType({
  name: 'CreateResultType',
  fields: {
    status: {
      type: new NonNull(StringType),
      description: 'Status SUCCESS or FAILED',
    },
    message: { type: StringType, description: 'Error Message' },
    data: { type: UserRoleType, description: 'Inserted data' },
  },
});

const CommonResultType = new ObjectType({
  name: 'UpdateResultType',
  fields: {
    status: {
      type: new NonNull(StringType),
      description: 'Status SUCCESS or FAILED',
    },
    message: { type: StringType, description: 'Error Message' },
  },
});

// --------------------------------------MUTATION---------------------------------------------

export const CreateUserRole = {
  args: {
    roleName: {
      type: new NonNull(StringType),
      description: 'Role name is required',
    },
    readAccess: {
      type: new NonNull(new List(SystemRoleType)),
      description: 'Array of system roles',
    },
    writeAccess: {
      type: new NonNull(new List(SystemRoleType)),
      description: 'Array of system roles',
    },
  },
  type: CreateResultType,
  async resolve(obj, args, context) {
    return createRole(args, context);
  },
};

export const UpdateUserRole = {
  args: {
    roleId: {
      type: new NonNull(StringType),
      description: 'Role id is required',
    },
    roleName: {
      type: new NonNull(StringType),
      description: 'Role name is required',
    },
    readAccess: {
      type: new NonNull(new List(SystemRoleType)),
      description: 'Array of system roles',
    },
    writeAccess: {
      type: new NonNull(new List(SystemRoleType)),
      description: 'Array of system roles',
    },
  },
  type: CommonResultType,
  async resolve(obj, args, context) {
    return updateUserRoles(args, context);
  },
};

export const DeleteUserRole = {
  args: {
    roleName: {
      type: new NonNull(StringType),
      description: 'Role name is required',
    },
  },
  type: CommonResultType,
  async resolve(obj, args, context) {
    return deleteUserRoles(args, context);
  },
};

export const RegisterNewUser = {
  args: {
    emails: {
      type: new NonNull(new List(StringType)),
      description: "Email's of the user to be created",
    },
    roleName: {
      type: new NonNull(new List(StringType)),
      description: 'role to be assigned to these users ',
    },
    hierarchy: {
      type: new NonNull(new List(InputHierarchyType)),
      description: 'Hierarcy for which these roles are applicable',
    },
  },
  type: CommonResultType,
  async resolve(obj, args, context) {
    return registerUsers(args, context);
  },
};

export const RemoveUser = {
  args: {
    email: {
      type: new NonNull(new List(StringType)),
      description: "Email's of the user to be created",
    },
  },
  type: CommonResultType,
  async resolve(obj, args, context) {
    return removeUser(args, context);
  },
};

export const UpdateUser = {
  args: {
    emails: {
      type: new NonNull(new List(StringType)),
      description: "Email's of the user to be created",
    },
    roleName: {
      type: new NonNull(new List(StringType)),
      description: 'role to be assigned to these users ',
    },
    hierarchy: {
      type: new NonNull(new List(InputHierarchyType)),
      description: 'Hierarcy for which these roles are applicable',
    },
  },
  type: CommonResultType,
  async resolve(obj, args, context) {
    return updateUsers(args, context);
  },
};

export default {
  CreateUserRole,
  UpdateUserRole,
  DeleteUserRole,
  RegisterNewUser,
  UpdateUser,
  RemoveUser,
};
