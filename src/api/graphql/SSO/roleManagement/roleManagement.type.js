/**
@author Gaurav Chauhan
@date    XX/XX/XXXX
@version 1.0.0
*/

import {
  // GraphQLObjectType as ObjectType,
  GraphQLString as StringType,
  GraphQLInputObjectType as InputObjectType,
  // GraphQLNonNull as NonNull,
  GraphQLInt as IntType,
  GraphQLBoolean as BooleanType,
} from 'graphql';

import GraphQLJSON from 'graphql-type-json';

// const UserRoleInputType = new InputObjectType({
//   name: 'UserRoleInputType',
//   fields: {
//     qno: { type: StringType, description: 'Question number,eg \'Q1\' ' },
//     subject: { type: StringType, description: 'subject for subject wise query' },
//     queryCursor: { type: StringType, description: 'Cursor for batch query' },
//     testId: { type: new NonNull(StringType), description: 'testId for which question is to be fetched' },
//     limit: { type: IntType, description: 'maximum amount of data in one batch' },
//   },
// });

// const UserRoleType = new ObjectType({
//   name: 'UserRoleType',
//   fields: {
//     option: { type: StringType, description: 'option key' },
//     optionText: { type: StringType, description: 'option value' },
//   },
// });

export const InputHierarchyType = new InputObjectType({
  name: 'InputHierarchyType',
  description: 'Institute Hierarchy',
  fields: {
    child: { type: StringType, description: 'Name of the node' },
    childCode: { type: StringType, description: 'Internal code of the node' },
    parent: { type: StringType, description: 'Parent name of the node' },
    parentCode: {
      type: StringType,
      description: 'Internal code for the parent of the node',
    },
    level: { type: IntType, description: 'Level of the node' },
    selected: { type: BooleanType, description: 'Selected status of the node' },
    next: {
      type: GraphQLJSON,
      description: 'List of child nodes with above described JSON',
    },
    isLeafNode: {
      type: BooleanType,
      description: 'Specifies if a node is leaf node or not',
    },
  },
});

export default {
  // UserRoleInputType,
  // UserRoleType,
  InputHierarchyType,
};
