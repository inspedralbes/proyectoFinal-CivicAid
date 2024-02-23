import { Provider } from 'react-redux';
import { store } from '../components/store';
import AppOngoing from '../components/provider_applicationOngoing'
import { BrowserRouter as Router } from 'react-router-dom';


const ApplicationOngoing = () => (
    <Provider store={store}>
        <AppOngoing />
    </Provider>

);
export default ApplicationOngoing;
