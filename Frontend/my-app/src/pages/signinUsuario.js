import React from 'react';
import { Provider } from 'react-redux';
import SigninForm from '../components/provider_signinUsuario';
import { store } from '../components/store';

const SigninUsuario = () => (
    <Provider store={store}>
        <SigninForm />
    </Provider>
);

export default SigninUsuario;
