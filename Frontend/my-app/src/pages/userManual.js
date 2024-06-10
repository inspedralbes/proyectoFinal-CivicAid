import React from 'react';
import { Provider } from 'react-redux';
import Manual from '../components/provider_userManual';
import { store } from '../components/store';

const UserManual = () => (
    <Provider store={store}>
        <Manual />
    </Provider>
);

export default UserManual;
