import React from 'react';
import { Provider } from 'react-redux';
import SigninWorkerForm from '../components/provider_signinWorker';
import { store } from '../components/store';

const SigninWorker = () => (
    <Provider store={store}>
        <SigninWorkerForm />
    </Provider>
);

export default SigninWorker;
