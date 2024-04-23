import React from 'react';
import { Provider } from 'react-redux';
import LoginAdminForm from '../components/provider_loginAdmin';
import { store } from '../components/store';

const LoginAdmin = () => (
    <Provider store={store}>
        <LoginAdminForm />
    </Provider>
);

export default LoginAdmin;
