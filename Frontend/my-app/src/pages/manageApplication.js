import React from 'react';
import { Provider } from 'react-redux';
import ManageApplication from '../components/provider_manageApplication';
import { store } from '../components/store';

const Manage = () => (
    <Provider store={store}>
        <ManageApplication />
    </Provider>
);

export default Manage;
