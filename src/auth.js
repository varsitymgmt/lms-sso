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

function setInsituteNamePageTitle(instituteDetails) {
  if (instituteDetails) {
    const instituteName = instituteDetails.instituteName
      ? instituteDetails.instituteName
      : 'Egnify';
    localStorage.setItem('instituteName', instituteName);
    document.title = instituteName;
  }
}

const fetchInstituteHierarchy = new Promise(async resolve => {
  axios
    .post(`${window.App.apiEgnifyIoUrl}/graphql`, {
      query: `{Institute {
          hierarchy {parent child level code noOfNodes}, instituteName
        }
      }`,
    })
    .then(response => {
      let instituteDetails = {};
      if (
        response &&
        response.data &&
        response.data.data &&
        response.data.data.Institute &&
        response.data.data.Institute[0]
      ) {
        instituteDetails = response.data.data.Institute[0];
      }
      setInsituteNamePageTitle(instituteDetails);
      resolve(instituteDetails);
    })
    .catch(err => {
      resolve({});
      console.error('fetchInstituteHierarchy: ', err);
    });
});

async function isInstituteRegistered() {
  let registrationStatus = localStorage.getItem('registrationStatus');
  registrationStatus = registrationStatus === 'true';
  if (!registrationStatus) {
    const url = `${window.App.apiEgnifyIoUrl}/graphql`;
    return axios
      .post(url, { query: '{ Institute{registrationStatus} }' })
      .then(response => {
        if (
          response &&
          response.data &&
          response.data.data &&
          response.data.data.Institute &&
          response.data.data.Institute[0]
        ) {
          const data = response.data.data.Institute[0];
          localStorage.setItem('registrationStatus', data.registrationStatus);
          return data.registrationStatus;
        }
        return false;
      })
      .catch(err => {
        console.error(err);
        return false;
      });
  }
  return registrationStatus;
}

export const auth = {
  isAdmin,
  getUserDetailsIfAuthenticated,
  checkPassword,
  hasRole,
  isInstituteRegistered,
  setInsituteNamePageTitle,
  fetchInstituteHierarchy,
};

export default { auth };
