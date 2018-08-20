import React from 'react';
import LoginLayout from '../../components/LoginLayout';
import ResetPassword from './resetPassword';

function action() {
  return {
    component: (
      <LoginLayout>
        <ResetPassword />
      </LoginLayout>
    ),
  };
}

export default action;
