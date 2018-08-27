/*   eslint no-underscore-dangle: 0 */

import React from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './EnrollInstitute.css';

class EnrollInstitute extends React.Component {
  static contextTypes = { fetch: PropTypes.func.isRequired };

  constructor(props) {
    super(props);
    this.state = {
      institutes: [],
    };
  }

  componentDidMount() {
    this.getStudentsList();
  }
  // componentDidMount() {
  //   console.log(this.props.testPattern);
  //   axios.get('/api/checkfiles/').then(response => {
  //     console.error("asS", response); // do something with the response
  //   });
  // }

  getStudentsList = () => {
    axios.get('/api/institutes').then(response => {
      console.error(response.data); // do something with the response
      this.setState({ institutes: response.data });
    });
    // event.preventDefault();
  };

  removeIns = id => {
    axios.delete('/api/institutes/'.concat(id)).then(response => {
      console.error(response.data); // do something with the response
      this.setState({ institutes: response.data });
      window.location.reload();
    });
    // event.preventDefault();
  };

  handleCheckFormatSubmit = event => {
    const data = {};
    data.email = event.target.email.value;
    data.phone = event.target.phone.value;
    data.ownerName = event.target.ownerName.value;
    data.instituteName = event.target.instituteName.value;
    data.__subdomain = event.target.__subdomain.value;

    axios.post('/api/institutes', data).then(response => {
      console.error(response); // do something with the response
      window.location.reload();
    });
    event.preventDefault();
  };

  render() {
    return (
      <div className={s.root}>
        <div className={s.container}>
          <form onSubmit={this.handleCheckFormatSubmit}>
            <label htmlFor="email">
              EMail:
              <input id="email" type="email" />
            </label>
            <label htmlFor="phone">
              Phone:
              <input id="phone" type="phone" />
            </label>
            <label htmlFor="ownerName">
              Name:
              <input id="ownerName" type="text" />
            </label>
            <label htmlFor="instituteName">
              Institute Name:
              <input id="instituteName" type="text" />
            </label>
            <label htmlFor="__subdomain">
              Sub Domain:
              <input id="__subdomain" type="text" />
            </label>
            <input type="submit" value="Submit" />
          </form>
        </div>
        {this.state.institutes.map(institute => (
          <div>
            <div>
              Is Name: {institute.instituteName}
              <span>
                <button
                  style={{ marginRight: '50px' }}
                  onClick={() => this.removeIns(institute._id)}
                >
                  x
                </button>
              </span>
            </div>
          </div>
        ))}
      </div>
    );
  }
}

export default withStyles(s)(EnrollInstitute);
