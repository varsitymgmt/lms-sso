import React from 'react';
import SignOut from './SignOut';

function action() {
  return {
    chunks: ['SignOut'],
    component: (
      <div className={`row cover-full-container`}>
        <SignOut />
      </div>
    ),
  };
}

export default action;
