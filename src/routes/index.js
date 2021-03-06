/* eslint-disable global-require */

// The top-level (parent) route
const routes = {
  path: '/',
  // Keep in mind, routes are evaluated in order
  children: [
    {
      path: '/',
      load: () => import(/* webpackChunkName: 'SignIn' */ './sign-in'),
    },
    {
      path: '/signin',
      load: () => import(/* webpackChunkName: 'SignIn' */ './sign-in'),
    },
    {
      path: '/admin-signin',
      load: () =>
        import(/* webpackChunkName: 'AdminSignIn' */ './admin-sign-in'),
    },
    {
      path: '/signout',
      load: () => import(/* webpackChunkName: 'SignOut' */ './sign-out'),
    },
    {
      path: '/admin-signout',
      load: () => import(/* webpackChunkName: 'SignOut' */ './sign-out'),
    },
    {
      path: '/resetPassword',
      authenticate: false,
      load: () =>
        import(/* webpackChunkName: 'ResetPassword' */ './reset-password'),
    },
    {
      path: '/forgotPassword',
      authenticate: false,
      load: () => import(/* webpackChunkName: 'forgot' */ './forgot-password'),
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
