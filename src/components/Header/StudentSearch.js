import React from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import PropTypes from 'prop-types';
import axios from 'axios';
import s from './StudentSearch.scss'; // eslint-disable-line

class StudentSearch extends React.Component {
  /** Retrieving fetch from contextTypes */
  static contextTypes = {
    fetch: PropTypes.func.isRequired,
    GRAPHQL_API_URL: PropTypes.string.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      serachParam: '',
      searchResults: [],
      searchText: null,
    };
  }

  displaySearchSuggestions = () => {
    let div = null;
    if (this.state.searchText && this.state.searchResults.length > 0) {
      div = this.state.searchResults.map(student => (
        <a
          className={`${s.suggestionItem} row`}
          href={`/student-profile/Marks/${student.studentId}`}
          title={`${student.studentId} - ${student.studentName}`}
          target="_blank" //eslint-disable-line
          key={student.studentId}
        >
          <span className={` ${s.studentID}`}>
            {this.formatSearchText(student.studentId)}
          </span>
          <span className={`${s.studentNameAndCampus}`}>
            <div className={`hide-overflow ${s.studentName}`}>
              {this.formatSearchText(student.studentName)}
            </div>
            {/* <div className={`hide-overflow ${s.campus}`}>
              - {student.campusId}
            </div> */}
          </span>
        </a>
      ));
    } else if (this.state.searchText && this.state.searchText.length > 2) {
      div = <div className={s.suggestionItem}>No Results Found</div>;
    }
    return div;
  };

  formatSearchText = text => {
    let div = null;
    if (text && this.state.searchText) {
      const rg = new RegExp(
        `${this.state.searchText
          .toUpperCase()
          .replace(/([.?*+^$[\]\\(){}|-])/g, '\\$1')}(.+)`,
      );
      const splitText = text.split(rg);
      if (splitText && splitText.length > 1) {
        div = (
          <span>
            {splitText[0].replace(/ /g, '\u00a0')}
            <span className="normal-text">
              {this.state.searchText.toUpperCase().replace(/ /g, '\u00a0')}
            </span>
            {splitText[1].replace(/ /g, '\u00a0')}
          </span>
        );
      } else {
        div = text;
      }
    }
    return div;
  };

  handleStudentSearch = async e => {
    this.setState({ searchText: e.target.value });
    if (e.target.value.length >= 3) {
      const query = `{ Students
        (regex: "${e.target.value}",
        limit: 10,
        studentIdAndNameOnly:true
      ){
          page{
            studentName,
             studentId
      }}}`;

      const { data } = await axios.post(this.context.GRAPHQL_API_URL, {
        query,
      });
      // axios.post()
      if (data && data.data && data.data.Students && data.data.Students.page) {
        console.info('data.data.students');
        // console.info(data.data.Students);
        const page = data.data.Students.page;
        console.info(page);
        this.setState({ searchResults: page });
      } else {
        this.setState({ searchResults: [] });
      }
    } else {
      this.setState({ searchResults: [] });
    }
  };

  handleKeyDownEvent = e => {
    if (e.which === 13) {
      if (this.state.searchResults[0]) {
        window.open(
          `/student-profile/Marks/${this.state.searchResults[0].studentId}`,
          '_blank',
        );
      }
      // this.props.toggleCommentsModal(this.state.isQuestionCommented);
    }
  };

  handleOnClickOnSearchContainer = () => {
    // attach/remove event handler
    if (!this.state.isSearchActive) {
      document.addEventListener('click', this.handleOutSideClick, false);
    } else {
      document.removeEventListener('click', this.handleOutSideClick, false);
    }
    this.setState({ isSearchActive: !this.state.isSearchActive });
  };

  handleOutSideClick = e => {
    // ignore clicks on the component itself
    if (this.searchContainer.contains(e.target)) {
      return;
    }
    this.setState({ searchText: null, searchResults: [] });
    this.searchInput.value = '';
    this.handleOnClickOnSearchContainer();
  };

  render() {
    return (
      <div
        role="presentation"
        onClick={() => this.handleOnClickOnSearchContainer()}
        ref={e => {
          this.searchContainer = e;
        }}
        className={s.root}
        style={{ opacity: '1', cursor: 'not-allowed' }}
      >
        <input
          type="text"
          placeholder="Search by ID, Name"
          className={s.studentSearch}
          onChange={this.handleStudentSearch}
          onKeyDown={this.handleKeyDownEvent}
          spellCheck="false"
          ref={e => {
            this.searchInput = e;
          }}
          style={{ cursor: 'auto' }}
        />
        <img
          className={s.searchIcon}
          src="/images/icons/search_student.svg"
          alt=""
        />
        <div className={s.searchSuggestion}>
          {this.displaySearchSuggestions()}
        </div>
      </div>
    );
  }
}

export default withStyles(s)(StudentSearch);
