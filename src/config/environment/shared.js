/* eslint-disable */
exports = module.exports = {
  // List of user roles
  accessType:{ read: 2,write:3 },

  systemRoles:['ANALYSIS','REPORTS','TESTS','SETTINGS'],  //based on redirection priority
  role : {
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
};
