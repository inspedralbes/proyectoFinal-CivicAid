import React from 'react';
import { Provider } from 'react-redux';
import ManageApplications from '../components/provider_manageApplication';
import { store } from '../components/store';

const Manage = () => (
    <Provider store={store}>
        <ManageApplications />
    </Provider>
);

export default Manage;
