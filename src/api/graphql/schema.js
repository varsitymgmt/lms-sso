/**
   @author Gaurav Chauhan
   @date    XX/XX/XXXX
   @version 1.0.0
*/

import {
  GraphQLSchema as Schema,
  GraphQLObjectType as ObjectType,
  // GraphQLInt as IntType,
} from 'graphql';

import {
  ReadUserRole,
  UserList,
} from './SSO/roleManagement/roleManagement.query';
import {
  CreateUserRole,
  UpdateUserRole,
  DeleteUserRole,
  RegisterNewUser,
  RemoveUser,
  UpdateUser,
} from './SSO/roleManagement/roleManagement.mutation';

const schema = new Schema({
  query: new ObjectType({
    name: 'Query',
    fields: {
      ReadUserRole,
      UserList,
    },
  }),
  mutation: new ObjectType({
    name: 'Mutation',
    fields: {
      CreateUserRole,
      UpdateUserRole,
      DeleteUserRole,
      RegisterNewUser,
      UpdateUser,
      RemoveUser,
    },
  }),
});

export default schema;
