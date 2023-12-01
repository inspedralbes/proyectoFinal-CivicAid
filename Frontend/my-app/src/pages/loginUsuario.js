import React from 'react';
import { Provider } from 'react-redux';
import LoginForm from '../components/provider_loginUsuario';
import { store } from '../components/store';

const LoginUsuario = () => (
    <Provider store={store}>
        <LoginForm />
    </Provider>
);

export default LoginUsuario;
