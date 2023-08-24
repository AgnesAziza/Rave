import { Provider } from 'react-redux';
import Toast from 'react-native-toast-message';
import HomeScreen from './views/HomeScreen';
import { store } from './redux/store';

const App = () => {
    return (
        <Provider store={store}>
            <HomeScreen />
            <Toast />  
        </Provider>
    );
};

export default App;
