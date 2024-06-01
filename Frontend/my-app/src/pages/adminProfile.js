import React from 'react';
import { Provider } from 'react-redux';
import AdminProfile from '../components/provider_adminProfile';
import { store } from '../components/store';

const adminProfile = () => (
    <Provider store={store}>
        <AdminProfile />
    </Provider>
);

export default adminProfile;
