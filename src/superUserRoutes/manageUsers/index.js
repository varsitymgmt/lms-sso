import React from 'react';
import ManageUsers from './manageUsers';
import Layout from '../../components/Layout';

function action() {
  return {
    component: (
      <Layout activePage="">
        <ManageUsers />
      </Layout>
    ),
  };
}

export default action;
