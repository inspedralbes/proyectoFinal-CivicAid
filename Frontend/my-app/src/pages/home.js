import { Provider } from 'react-redux';
import { store } from '../components/store';
import Home from '../components/provider_home'
import { BrowserRouter as Router } from 'react-router-dom';



const App = () => (
        <Provider  store={store}>
            <Home />
        </Provider>

);
export default App;
