import React from 'react';
import { Provider } from 'react-redux';
import SigninRequest from '../components/provider_signinRequests';
import { store } from '../components/store';

const SigninRequests = () => (
    <Provider store={store}>
        <SigninRequest />
    </Provider>
);

export default SigninRequests;
