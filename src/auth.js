import axios from 'axios';

// add axios interceptor
axios.interceptors.request.use(
  configuration => {
    const token = localStorage.getItem('token');
    if (token != null) {
      configuration.headers.Authorization = `Bearer ${token}`; // eslint-disable-line
    }
    return configuration;
  },
  err => Promise.reject(err),
);

// Function to get user details if the current user is authenticated.
function getUserDetailsIfAuthenticated() {
  return new Promise((resolve, reject) => { // eslint-disable-line
    axios
      .get(`${window.App.apiEgnifyIoUrl}/api/v1/users/me`)
      .then(response => {
        resolve({
          authencationStatus: true,
          user: response.data,
        });
      })
      .catch(() => resolve({ authencationStatus: false }));
  });
}

// check role of a user.
async function hasRole(role) {
  const details = await getUserDetailsIfAuthenticated(
    window.App.apiEgnifyIoUrl,
  );
  if (details.authencationStatus === false) return false;

  if (details.user) {
    if (details.user.role === role) return true;
  }
  return false;
}

// checks if the user is an admin.
function isAdmin() {
  return hasRole('admin');
}

// Function to check the password.
async function checkPassword(password) {
  try {
    const details = await axios.get(
      `${window.App.apiEgnifyIoUrl}/api/v1/users/me`,
    );
    if (details.data) {
      const user = details.data;
      const email = user.email;
      const payload = {
        email,
        password,
        hostname: __DEV__
          ? 'luke.dev.hydra.egnify.io'
          : window.location.hostname,
      };
      const response = await axios.post(
        `${window.App.apiEgnifyIoUrl}/auth/local`,
        payload,
      );
      if (response && response.data) {
        const token = response.data.token;
        localStorage.setItem('token', token);
        return true;
      }
    }
    return false;
  } catch (err) {
    console.warn(`auth checkPassword: ${err}`);
    return false;
  }
}

export const auth = {
  isAdmin,
  getUserDetailsIfAuthenticated,
  checkPassword,
  hasRole,
};

export default { auth };
