import React from 'react';
import PropTypes from 'prop-types';
// import axios from 'axios';
import serialize from 'serialize-javascript';

/* eslint-disable react/no-danger */

class Html extends React.Component {
  static propTypes = {
    title: PropTypes.string,
    description: PropTypes.string.isRequired,
    scripts: PropTypes.arrayOf(PropTypes.string.isRequired),
    app: PropTypes.object, // eslint-disable-line
    children: PropTypes.string.isRequired,
  };

  static defaultProps = {
    styles: [],
    scripts: [],
  };

  render() {
    const { title, description, scripts, app, children } = this.props;
    return (
      <html className="no-js" lang="en">
        <head>
          <meta charSet="utf-8" />
          <meta httpEquiv="x-ua-compatible" content="ie=edge" />
          <title>{title || 'Egnify'}</title>
          <meta name="description" content={description} />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link
            rel="stylesheet"
            href="/plugins/materialize/css/materialize.min.css"
          />
          <link
            rel="stylesheet"
            href="/plugins/materialize/css/custom-libraries.css"
          />
          <link rel="stylesheet" href="/plugins/react-select.css" />
          <link
            rel="stylesheet"
            href="/plugins/font-awesome/css/font-awesome.min.css"
          />
          <link href="/css/fonts/SF-Pro-Text.css" rel="stylesheet" />
          <link rel="stylesheet" href="/css/style.css" />
          {scripts
            ? scripts.map(script => (
                <link key={script} rel="preload" href={script} as="script" />
              ))
            : null}
        </head>
        <body>
          {/* Page pre loader */}
          <div
            id="page-loader"
            style={{
              background: 'rgba(255, 255, 255, 1)',
              bottom: '0',
              display: 'block',
              left: '0',
              position: 'fixed',
              right: '0',
              top: '0',
              zIndex: '9',
              transition: 'all 2s ease',
            }}
          >
            <img
              src="/images/loader.svg"
              alt="loader"
              style={{
                background: '#fff',
                left: '48%',
                position: 'fixed',
                top: '44%',
                zIndex: '2',
              }}
            />
          </div>
          <div
            id="app"
            dangerouslySetInnerHTML={{ __html: children }}
            style={{ position: 'relative', height: '100%' }}
          />
          <script
            dangerouslySetInnerHTML={{ __html: `window.App=${serialize(app)}` }}
          />
          {scripts
            ? scripts.map(script => <script key={script} src={script} />)
            : null}
        </body>
      </html>
    );
  }
}
Html.defaultProps = {
  title: 'Egnify',
};

export default Html;
