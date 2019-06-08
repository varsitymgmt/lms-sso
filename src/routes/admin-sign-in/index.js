import React from 'react';
import AdminSignIn from './AdminSignIn';

function action() {
  return {
    chunks: ['AdminSignIn'],
    component: (
      <div className={`row cover-full-container`}>
        <AdminSignIn />
      </div>
    ),
  };
}

export default action;
