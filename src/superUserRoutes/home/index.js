import React from 'react';
import Home from './Home';
import Layout from '../../components/Layout';

function action() {
  return {
    component: (
      <Layout activePage="tests">
        <Home />
      </Layout>
    ),
  };
}

export default action;
