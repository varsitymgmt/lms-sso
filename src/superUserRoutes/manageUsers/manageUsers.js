import React from 'react';
import axios from 'axios';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './manageUsers.css';

class manageUsers extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      users: [],
      institutes: [],
      username: '',
      email: '',
      institute: '',
      message: '',
    };
    this.updateUserName = this.updateUserName.bind(this);
    this.updateInstitute = this.updateInstitute.bind(this);
    this.updateEmail = this.updateEmail.bind(this);
    // this.loadUsers = this.loadUsers.bind(this);
    this.loadInstitutes = this.loadInstitutes.bind(this);
    this.createUser = this.createUser.bind(this);
    this.deleteUser = this.deleteUser.bind(this);
    this.updatePassword = this.updatePassword.bind(this);
  }

  componentDidMount() {
    // console.log('reaching here');
    this.loadInstitutes();
    this.loadUsers();
  }

  loadInstitutes() {
    axios.get('/api/institutes').then(response => {
      // console.log(response.data);
      this.setState({ institutes: response.data });
    });
  }

  loadUsers() {
    axios.get('/api/User/getUsers').then(response => {
      this.setState({
        users: response.data.users,
      });
    });
  }

  updateUserName = event => {
    this.setState({
      username: event.target.value,
    });
  };

  updateEmail = event => {
    this.setState({
      email: event.target.value,
    });
  };

  updateInstitute() {
    this.setState({
      institute: document.getElementById('institutedropDown').value,
    });
  }

  createUser() {
    const institute = document.getElementById('institutedropDown').value;
    const email = this.state.email;
    const username = this.state.username;
    if (!institute || !email || !username)
      this.setState({
        message: 'check all the fields once again',
      });
    else {
      const index = parseInt(institute, 10);
      const subDomain = this.state.institutes[index].url;
      const org = this.state.institutes[index].__subdomain; //eslint-disable-line
      const jsonObj = {
        email,
        subDomain,
        org,
        username,
      };
      axios.post('/api/User/addNewUser', jsonObj).then(response => {
        console.log(response.data); // eslint-disable-line
        this.setState({
          message: 'created User Succesfully',
        });
        setTimeout(() => {
          this.loadUsers();
        }, 3000);
      });
    }
  }

  deleteUser(email) { // eslint-disable-line
    const json = { email };
    axios.post('/api/User/deleteUser', json).then(response => {
      console.log(response.data); //eslint-disable-line
      this.loadUsers();
    });
  }

  updatePassword(email) { //eslint-disable-line
    const newPassword = document.getElementById(email).value;
    const userJson = {
      email,
      newPassword,
    };
    axios.post('/api/User/updatePassword', userJson).then(response => {
      if (response.data.n >= 1)
        this.setState({
          message: 'Password updated succesfully',
        });
    });
  }

  render() {
    return (
      <div className={`row`}>
        <div
          style={{
            padding: '20px',
          }}
          className={`card col m10 offset-m1`}
        >
          <div className={s.head}>Create User </div>
          <br />
          <div className={`col m3`}>
            Username:
            <input id="usrname" type="text" onChange={this.updateUserName} />
          </div>
          <div className={`col m3`}>
            EMail:
            <input id="email" onChange={this.updateEmail} />
          </div>
          <div className={`col m3`}>
            Institute:
            <select id="institutedropDown">
              <option value=""> ---- select Institute ---- </option>
              {this.state.institutes.map((institute, index) =>
                <option value={index}>
                  {institute.instituteName}
                </option>,
              )}
              onChange={this.updateInstitute}
            </select>
          </div>
          <div>
            <button onClick={this.createUser}>create User</button>
          </div>
          <br /> <br />
          <div>message: {this.state.message}</div>
        </div>
        <div className={`row `}>
          <div className={`col m10 offset-m1`}>
            {this.state.users.map(user =>
              <div
                className={`row`}
                style={{
                  margin: '10px',
                }}
              >
                <div className={`col m3`}>
                  <b>username</b>: {user.username}
                </div>
                <div className={`col m2`}>
                  <b>org</b>: {user.org}
                </div>
                <div className={`col m2`}>
                  <button
                    onClick={() => {
                      const email = user.email;
                      this.deleteUser(email);
                    }}
                  >
                    Delete User
                  </button>
                </div>
                <div className={`col m4`}>
                  <input id={user.email} />
                  <button
                    style={{
                      marginLeft: '2px',
                    }}
                    onClick={() => {
                      const email = user.email;
                      this.updatePassword(email);
                    }}
                  >
                    Update Password
                  </button>
                </div>
              </div>,
            )}
          </div>
        </div>
      </div>
    );
  }
}

export default withStyles(s)(manageUsers);
