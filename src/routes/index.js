/* eslint-disable global-require */

// The top-level (parent) route
const routes = {
  path: '/',
  // Keep in mind, routes are evaluated in order
  children: [
    {
      path: '/',
      load: () => import(/* webpackChunkName: 'analysis' */ './analysis'),
    },
    {
      path: '/analysis',
      children: [
        {
          path: '/',
          load: () => import(/* webpackChunkName: 'analysis' */ './analysis'),
        },
        {
          path: '/concept',
          load: () => import(/* webpackChunkName: 'analysis' */ './analysis'),
        },
        {
          path: '/error',
          load: () => import(/* webpackChunkName: 'analysis' */ './analysis'),
        },
        {
          path: '/question-details',
          load: () => import(/* webpackChunkName: 'analysis' */ './analysis'),
        },
        {
          path: '/marks',
          load: () => import(/* webpackChunkName: 'analysis' */ './analysis'),
        },
      ],
    },
    {
      path: '/reports',
      load: () => import(/* webpackChunkName: 'reports' */ './reports'),
    },
    {
      path: '/',
      shouldAuthenticate: true,
      load: () =>
        import(/* webpackChunkName: 'TestsList' */ './test/tests/tests-list'),
    },
    {
      path: '/test',
      children: [
        {
          path: '/',
          // shouldAuthenticate: true,
          load: () =>
            import(/* webpackChunkName: 'TestsList' */ './test/tests/tests-list'),
        },
        {
          path: '/marking-schema',
          // shouldAuthenticate: true,
          load: () =>
            import(/* webpackChunkName: 'MarkingSchema' */ './test/marking-schema/view'),
        },
        {
          path: '/marking-schema/add',
          // shouldAuthenticate: true,
          load: () =>
            import(/* webpackChunkName: 'AddMarkingSchema' */ './test/marking-schema/add'),
        },
        {
          path: '/marking-schema/:markingSchema',
          // shouldAuthenticate: true,
          load: () =>
            import(/* webpackChunkName: 'MarkingSchema' */ './test/marking-schema/view'),
        },
        {
          path: '/iit-converter',
          // shouldAuthenticate: true,
          load: () =>
            import(/* webpackChunkName: 'OMRConverter' */ './test/omr-converter'),
        },
        {
          path: '/create-test',
          children: [
            {
              path: '/step1',
              load: () =>
                import(/* webpackChunkName: 'Step1' */ './test/tests/create-test/Step1'),
            },
            {
              path: '/step1/:testID/*',
              load: () =>
                import(/* webpackChunkName: 'Step1' */ './test/tests/create-test/Step1'),
            },
            {
              path: '/step2/:testID',
              load: () =>
                import(/* webpackChunkName: 'Step2' */ './test/tests/create-test/Step2'),
            },
            {
              path: '/step2/:testID/*',
              load: () =>
                import(/* webpackChunkName: 'Step2' */ './test/tests/create-test/Step2'),
            },
            {
              path: '/step3/:testID',
              load: () =>
                import(/* webpackChunkName: 'Step3' */ './test/tests/create-test/Step3'),
            },
            {
              path: '/step3/:testID/*',
              load: () =>
                import(/* webpackChunkName: 'Step3' */ './test/tests/create-test/Step3'),
            },
          ],
        },
        {
          path: '/result-upload/omr-converter',
          load: () =>
            import(/* webpackChunkName: 'omr-converter' */ './test/tests/result-upload/omr-converter'),
        },
        {
          path: '/:testID/result-upload',
          load: () =>
            import(/* webpackChunkName: 'tests' */ './test/tests/result-upload/tests'),
        },
        {
          path: '/:testType',
          load: () =>
            import(/* webpackChunkName: 'TestsList' */ './test/tests/tests-list'),
        },
      ],
    },

    {
      path: '/my-account',
      load: () => import(/* webpackChunkName: 'myaccount' */ './my-account'),
    },
    {
      path: '/privacy-policy',
      load: () =>
        import(/* webpackChunkName: 'privacypolicy' */ './my-account/privacy-policy'),
    },
    {
      path: '/terms-and-conditions',
      load: () =>
        import(/* webpackChunkName: 'termsandconditions' */ './my-account/terms-and-conditions'),
    },
    {
      path: '/settings',
      children: [
        {
          path: '/',
          shouldAuthenticate: true,
          load: () =>
            import(/* webpackChunkName: 'set-up' */ './settings/set-up'),
        },
        {
          path: '/set-up',
          shouldAuthenticate: true,
          children: [
            {
              path: '/',
              shouldAuthenticate: true,
              load: () =>
                import(/* webpackChunkName: 'basic-details' */ './settings/set-up'),
            },
            {
              path: '/basic_details',
              shouldAuthenticate: true,
              load: () =>
                import(/* webpackChunkName: 'basic-details' */ './settings/set-up'),
            },
            {
              path: '/institute_configuration',
              shouldAuthenticate: true,
              load: () =>
                import(/* webpackChunkName: 'institute-configuration' */ './settings/set-up'),
            },
          ],
        },
        {
          path: '/details',
          shouldAuthenticate: true,
          load: () =>
            import(/* webpackChunkName: 'details' */ './settings/details'),
        },
        {
          path: '/concept-taxonomy',
          shouldAuthenticate: true,
          load: () =>
            import(/* webpackChunkName: 'concept-taxonomy' */ './settings/concept-taxonomy'),
        },
        {
          path: '/students',
          shouldAuthenticate: true,
          load: () =>
            import(/* webpackChunkName: 'settings-students' */ './settings/students/view'),
        },
        {
          path: '/students/add',
          shouldAuthenticate: true,
          load: () =>
            import(/* webpackChunkName: 'settings-students-add' */ './settings/students/add'),
        },
        {
          path: '/students/edit',
          shouldAuthenticate: true,
          load: () =>
            import(/* webpackChunkName: 'settings-students-add' */ './settings/students/add'),
        },
        {
          path: '/institute-details',
          shouldAuthenticate: true,
          load: () =>
            import(/* webpackChunkName: 'institute-details' */ './settings/institute-details/view'),
        },
        {
          path: '/institute-details/add',
          shouldAuthenticate: true,
          load: () =>
            import(/* webpackChunkName: 'institute-details-add' */ './settings/institute-details/add'),
        },
        {
          path: '/subjects',
          shouldAuthenticate: true,
          children: [
            {
              path: '/',
              shouldAuthenticate: true,
              load: () =>
                import(/* webpackChunkName: 'add-curriculum' */ './settings/subjects/add-curriculum'),
            },
            {
              path: '/add-curriculum',
              shouldAuthenticate: true,
              load: () =>
                import(/* webpackChunkName: 'add-curriculum'' */ './settings/subjects/add-curriculum'),
            },
            {
              path: '/add-subjects',
              shouldAuthenticate: true,
              load: () =>
                import(/* webpackChunkName: 'add-subjects' */ './settings/subjects/add-subjects'),
            },
          ],
        },
        {
          path: '/mode-of-exam',
          shouldAuthenticate: true,
          load: () =>
            import(/* webpackChunkName: 'mode-of-exam' */ './settings/mode-of-exam'),
        },
        {
          path: '/grading',
          shouldAuthenticate: true,
          children: [
            {
              path: '/',
              shouldAuthenticate: true,
              load: () =>
                import(/* webpackChunkName: 'grading-system' */ './settings/grading/grading-system'),
            },
            {
              path: '/grading-system',
              shouldAuthenticate: true,
              load: () =>
                import(/* webpackChunkName: 'grading-system'' */ './settings/grading/grading-system'),
            },
            {
              path: '/grading-details',
              shouldAuthenticate: true,
              load: () =>
                import(/* webpackChunkName: 'grading-details' */ './settings/grading/grading-details'),
            },
          ],
        },
      ],
    },
    {
      path: '/login',
      shouldAuthenticate: false,
      load: () => import(/* webpackChunkName: 'login' */ './login'),
    },
    {
      path: '/resetPassword',
      load: () =>
        import(/* webpackChunkName: 'ResetPassword' */ './reset-password'),
    },
    {
      path: '/institute-setup',
      shouldAuthenticate: true,
      load: () =>
        import(/* webpackChunkName: 'instituteSetup' */ './institute-setup'),
    },
    {
      path: '/student-profile/test/:studentID',
      load: () =>
        import(/* webpackChunkName: 'student-profile-detailed' */ './student-profile/test'),
    },
    {
      path: '/student-profile/marks/:studentID',
      load: () =>
        import(/* webpackChunkName: 'student-profile-overview' */ './student-profile/marks'),
    },
    {
      path: '/student-profile/concept/:studentID',
      load: () =>
        import(/* webpackChunkName: 'student-profile-overview' */ './student-profile/concept'),
    },
    // Wildcard routes, e.g. { path: '*', ... } (must go last)
    {
      path: '*',
      shouldAuthenticate: false,
      load: () => import(/* webpackChunkName: 'not-found' */ './not-found'),
    },
  ],

  async action({ next }) {
    // Execute each child route until one of them return the result
    const route = await next();
    // Provide default values for title, description etc.
    // route.title = `${window.localStorage.getItem('instituteName') ||
    //   'Project Hydra'}`;
    route.description = route.description || '';
    return route;
  },
};

// The error page is available by permanent url for development mode
if (__DEV__) {
  routes.children.unshift({
    path: '/error',
    action: require('./error').default,
  });
}

export default routes;
