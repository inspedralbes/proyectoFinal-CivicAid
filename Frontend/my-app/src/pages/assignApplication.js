import React from 'react';
import { Provider } from 'react-redux';
import AssignApplication from '../components/provider_assignApplication';
import { store } from '../components/store';

const Assign = () => (
    <Provider store={store}>
        <AssignApplication />
    </Provider>
);

export default Assign;
