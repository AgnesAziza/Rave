import { Provider } from 'react-redux';
import Toast from 'react-native-toast-message';
import HomeScreen from './views/HomeScreen';
import RecordScreen from './views/RecordScreen';
import RaveScreen from './views/RaveScreen';
import { store, persistor } from './redux/store';
import { PersistGate } from 'redux-persist/integration/react';
import { NavigationContainer } from '@react-navigation/native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';

// Création d'une instance du navigateur à onglets
const Tab = createMaterialTopTabNavigator();

const App = () => {
    return (
      // Fournir le store Redux à l'application
      // Envelopper l'application dans PersistGate pour permettre la persistance des données Redux
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <NavigationContainer>
            <Tab.Navigator>
              <Tab.Screen name="Home" component={HomeScreen} />
              <Tab.Screen name="Record" component={RecordScreen} />
              <Tab.Screen name="Rave" component={RaveScreen} />
            </Tab.Navigator>
          </NavigationContainer>
          <Toast />
        </PersistGate>
      </Provider>
    );
};

export default App;
