import {
  GraphQLList as List,
  GraphQLNonNull as NonNull,
  GraphQLString as StringType,
  GraphQLObjectType as ObjectType,
  GraphQLBoolean as BooleanType,
} from 'graphql';
import GraphQLJSON from 'graphql-type-json';

import { RolesListOutputType } from './roleManagement.type';

import {
  readRoles,
  getRolesList,
} from '../../../api/v1/userRoles/userRoles.controller';
import { getUserList } from '../../../api/v1/user/user.controller';

const ReadWriteDataType = new ObjectType({
  name: 'ReadWriteDataType',
  fields: {
    readAndWrite: {
      type: new List(StringType),
      description: 'Read and write access',
    },
    read: { type: new List(StringType) },
    write: { type: new List(StringType) },
    none: { type: new List(StringType) },
  },
});

const ReadResultType = new ObjectType({
  name: 'ReadResultType',
  fields: {
    roleName: { type: StringType, description: 'role name' },
    roleId: { type: StringType, description: 'role Id' },
    defaultRole: {
      type: BooleanType,
      description: 'default role cannot be changed',
    },
    data: { type: new NonNull(ReadWriteDataType), description: 'matrix data' },
  },
});
export const ReadUserRole = {
  args: {
    roleName: {
      type: StringType,
      description: 'provide if you need role specific data',
    },
  },
  type: new List(ReadResultType),
  async resolve(obj, args, context) {
    return readRoles(args, context);
  },
};

const UserListType = new ObjectType({
  name: 'UserListType',
  fields: {
    username: { type: StringType, description: 'role name' },
    role: { type: new List(StringType), description: 'role Id' },
    email: { type: StringType, description: 'Email' },
    hierarchy: { type: GraphQLJSON, description: 'Access Hierarchy' },
    rawHierarchy: { type: GraphQLJSON, description: 'Raw Hierarchy for Ui' },
  },
});

export const UserList = {
  args: {
    emails: {
      type: new List(StringType),
      description: 'provide if you need data of specific user',
    },
  },
  type: new List(UserListType),
  async resolve(obj, args, context) {
    return getUserList(args, context);
  },
};

export const RolesList = {
  args: {},
  type: new List(RolesListOutputType),
  async resolve(obj, args, context) {
    return getRolesList(args, context);
  },
};

export default {
  ReadUserRole,
  UserList,
  RolesList,
};
