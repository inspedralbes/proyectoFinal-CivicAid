import React from 'react';
import { Provider } from 'react-redux';
import WorkerProfile from '../components/provider_workerProfile';
import { store } from '../components/store';

const workerProfile = () => (
    <Provider store={store}>
        <WorkerProfile />
    </Provider>
);

export default workerProfile;
