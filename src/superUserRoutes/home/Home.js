import React from 'react';
// import PropTypes from 'prop-types';
import axios from 'axios';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Home.css';

class Home extends React.Component {
  // static propTypes = {
  //   news: PropTypes.arrayOf(
  //     PropTypes.shape({
  //       title: PropTypes.string.isRequired,
  //       link: PropTypes.string.isRequired,
  //       content: PropTypes.string,
  //     }),
  //   ).isRequired,
  // };

  // static contextTypes = { fetch: PropTypes.func.isRequired };
  // componentDidMount() {
  //   console.log(this.props.testPattern);
  //   axios.get('/api/checkfiles/').then(response => {
  //     console.error("asS", response); // do something with the response
  //   });
  // }

  // handleUploadFile = event => {
  //   const data = new FormData();
  //   data.append('files', event.target.files[0]);
  //   data.append('name', 'some value user types');
  //   data.append('description', 'some value user types');
  //   // // '/files' is your node.js route that triggers our middleware
  //   axios.post('/api/students/populateDb', data).then(response => {
  //     console.error(response); // do something with the response
  //   });
  // };

  handleConceptTaxonomyFile = event => {
    const data = new FormData();
    data.append('files', event.target.files[0]);
    data.append('name', 'some value user types');
    data.append('description', 'some value user types');
    // // '/files' is your node.js route that triggers our middleware
    axios
      .post('/api/conceptTaxonomy/populateConceptTaxonomy', data)
      .then(response => {
        console.error(response); // do something with the response
      });
  };

  // handleSubmit = event => {
  //   const data = new FormData();
  //   data.append('files', event.target.errorReport.files[0]);
  //   data.append('files', event.target.markingSchema.files[0]);
  //   data.append('name', 'some value user types');
  //   data.append('description', 'some value user types');
  //   // '/files' is your node.js route that triggers our middleware
  //   axios.post('/api/masterResults/populateDb', data).then(response => {
  //     console.error(response); // do something with the response
  //   });
  //   event.preventDefault();
  // };

  render() {
    return (
      <div className={s.root}>
        <div className={s.container}>
          <label htmlFor="conceptTaxonomy">
            Concept Taxonomy CSV(Auto fires No Submit button):
            <input
              id="conceptTaxonomy"
              type="file"
              accept=".csv"
              onChange={this.handleConceptTaxonomyFile}
            />
          </label>
        </div>
      </div>
    );
  }
}

export default withStyles(s)(Home);
