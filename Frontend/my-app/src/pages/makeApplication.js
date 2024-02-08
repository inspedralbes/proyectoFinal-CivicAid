import React from 'react';
import { Provider } from 'react-redux';
import MakeApplication from '../components/provider_makeApplication';
import { store } from '../components/store';

const Application = () => (
    <Provider store={store}>
        <MakeApplication />
    </Provider>
);

export default Application;
