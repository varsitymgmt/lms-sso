/* eslint-disable */
exports = module.exports = {
  // List of user roles
  systemRoles:['SETTINGS','TESTS','REPORTS','ANALYSIS'],
  systemRolesObject : {
    settings: "SETTINGS",
    tests: "TESTS",
    reports: "REPORTS",
    analysis:"ANALYSIS"
  },
  userRoles:{
    student:"STUDENT",
  },
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
