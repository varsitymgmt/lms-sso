import React from 'react';
import SignIn from './forgotPassword';

function action() {
  return {
    chunks: ['forgot'],
    component: (
      <div className={`row cover-full-container`}>
        <SignIn />
      </div>
    ),
  };
}

export default action;
