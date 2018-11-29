import React from 'react';
import SignIn from './SignIn';

function action() {
  return {
    chunks: ['SignIn'],
    component: (
      <div className={`row cover-full-container`}>
        <SignIn />
      </div>
    ),
  };
}

export default action;
