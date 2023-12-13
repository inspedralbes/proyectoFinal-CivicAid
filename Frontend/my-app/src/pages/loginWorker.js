import React from 'react';
import { Provider } from 'react-redux';
import LoginForm from '../components/provider_loginWorker';
import { store } from '../components/store';

const LoginWorker = () => (
    <Provider store={store}>
        <LoginForm />
    </Provider>
);

export default LoginWorker;
