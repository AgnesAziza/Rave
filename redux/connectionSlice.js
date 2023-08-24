import { createSlice } from '@reduxjs/toolkit';

// Création d'une "slice" pour le state de connexion.
export const connectionSlice = createSlice({
    name: 'connection',
    
    initialState: {
        ip: '',
        port: '',
        isConnected: false,
    },
    
    // Les réducteurs définissent comment l'état doit changer en réponse à une action.
    reducers: {
        // Ce réducteur met à jour l'IP et le port dans le state.
        setConnectionInfo: (state, action) => {
            state.ip = action.payload.ip;
            state.port = action.payload.port;
        },
        
        // Ce réducteur met à jour le statut de la connexion dans le state.
        setConnectionStatus: (state, action) => {
            state.isConnected = action.payload;
        },
    },
});


export const { setConnectionInfo, setConnectionStatus } = connectionSlice.actions;

// Exportation du réducteur pour être utilisé dans le store Redux.
export default connectionSlice.reducer;
