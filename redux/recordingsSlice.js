import { createSlice } from '@reduxjs/toolkit';

export const recordingsSlice = createSlice({
    name: 'recordings',               
    initialState: [],                 // État initial de la slice, qui est un tableau vide dans ce cas
    reducers: {
        // Reducer pour ajouter un enregistrement
        addRecording: (state, action) => {
            state.push(action.payload); // Ajoute l'enregistrement (payload de l'action) à l'état (qui est un tableau)
        },
        // Reducer pour supprimer un enregistrement
        deleteRecording: (state, action) => {
            // Retourne un nouvel état sans l'enregistrement dont le nom correspond au payload de l'action
            return state.filter(rec => rec.name !== action.payload);
        }
    }
});

export const { addRecording, deleteRecording } = recordingsSlice.actions;

export default recordingsSlice.reducer;
