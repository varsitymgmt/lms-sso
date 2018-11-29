import React from 'react';
import EnrollInstitute from './EnrollInstitute';
import Layout from '../../components/Layout';

function action() {
  return {
    component: (
      <Layout activePage="tests">
        <EnrollInstitute />
      </Layout>
    ),
  };
}

export default action;
