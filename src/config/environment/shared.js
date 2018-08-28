/* eslint-disable */
exports = module.exports = {
  // List of user roles
  userRoles: ['guest', 'user', 'admin'],
  systemRoles:['SETTINGS','TESTS','REPORTS','ANALYSIS'],
  superAdmin : 'SUPER_ADMIN' ,
  graphqlSystemRolesEnum:{
    SETTINGS:{value:'SETTINGS'},
    TESTS:{value:'TESTS'},
    REPORTS:{value:'REPORTS'},
    ANALYSIS:{value:'ANALYSIS'}
  },
  celeryTask:{
    createUserTask:'create_user_by_admin'  
  },
};
