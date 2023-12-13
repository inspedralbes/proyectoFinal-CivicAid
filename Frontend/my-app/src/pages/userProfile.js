import React from 'react';
import { Provider } from 'react-redux';
import UserProfile from '../components/provider_userProfile';
import { store } from '../components/store';

const userProfile = () => (
    <Provider store={store}>
        <UserProfile />
    </Provider>
);

export default userProfile;
