import { configureStore, getDefaultMiddleware, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';

import connectionReducer from './connectionSlice';
import recordingsReducer from './recordingsSlice';

// Configuration de Redux Persist pour définir comment les données seront persistées.
// Dans ce cas, elles seront stockées dans AsyncStorage de React Native.
const persistConfig = {
    key: 'root',                            // Clé à laquelle les données seront associées dans AsyncStorage
    storage: AsyncStorage,                  // Définit où les données seront stockées (ici AsyncStorage)
    whitelist: ['connection', 'recordings'],// Les slices de données qui seront persistées
};

// Combine les différents réducteurs en un seul réducteur "root" pour le store
const rootReducer = combineReducers({
    connection: connectionReducer,
    recordings: recordingsReducer
});

// Enveloppe le rootReducer avec persistReducer pour ajouter la fonctionnalité de persistance
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Configure et crée le store Redux
const store = configureStore({
    reducer: persistedReducer,              // Utilise le réducteur persistant comme réducteur principal
    middleware: getDefaultMiddleware({
        serializableCheck: false           // Désactive le check de sérialisation (nécessaire lorsque certaines parties du state ne sont pas sérialisables)
    })
});

// Crée un persistor pour le store, ce qui permettra de charger/sauvegarder l'état de manière persistante
let persistor = persistStore(store);

export { store, persistor };
