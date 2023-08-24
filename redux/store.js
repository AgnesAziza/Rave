import { configureStore } from '@reduxjs/toolkit';

import connectionReducer from './connectionSlice';

//
export const store = configureStore({
    // L'objet de configuration doit avoir une clé 'reducer' qui définit les réducteurs.
    // Dans ce cas, "connection".
    reducer: {
        connection: connectionReducer
    }
});
