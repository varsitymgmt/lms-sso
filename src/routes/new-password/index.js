import React from 'react';
import LoginLayout from '../../components/LoginLayout';
import SetNewPassword from './setNewPassword';

function action() {
  return {
    component: (
      <LoginLayout>
        <SetNewPassword />
      </LoginLayout>
    ),
  };
}

export default action;
