import React from 'react';
import { Provider } from 'react-redux';
import ManageApplications from '../components/provider_manageApplication';
import { store } from '../components/store';

const Manage = ({socket}) => (
    <Provider store={store}>
        <ManageApplications socket={socket}/>
    </Provider>
);

export default Manage;
