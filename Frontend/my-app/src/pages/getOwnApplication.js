import { Provider } from 'react-redux';
import { store } from '../components/store';
import OwnApp from '../components/provider_getOwnApplication'
import { BrowserRouter as Router } from 'react-router-dom';


const OwnApplication = () => (
    <Provider store={store}>
        <OwnApp />
    </Provider>

);
export default OwnApplication;
