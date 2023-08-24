import React, { useState } from 'react';  
import { View, TextInput, Button, StyleSheet } from 'react-native';  
import { useDispatch, useSelector } from 'react-redux';  // Import des hooks Redux
import axios from 'axios';  // Import d'Axios pour les appels HTTP
import Toast from 'react-native-toast-message'; 

// Import des actions de Redux
import { setConnectionInfo, setConnectionStatus } from '../redux/connectionSlice';

const HomeScreen = () => {
    const dispatch = useDispatch();  // Hook Redux pour dispatch (envoyer) des actions
    const { ip, port } = useSelector(state => state.connection);  // Hook Redux pour sélectionner l'ip et le port du state

    // État local pour l'IP et le port temporaires
    const [tempIp, setTempIp] = useState('');
    const [tempPort, setTempPort] = useState('');

    // Fonction pour tester la connexion
    const handleTestConnection = async () => {
        try {
            // Tentative de connexion au serveur avec les valeurs temporaires
            const response = await axios.get(`http://${tempIp}:${tempPort}/`);
            
            // Si le serveur renvoie un statut 200 (OK)
            if (response.status === 200) {
                // Mise à jour de Redux avec les valeurs temporaires
                dispatch(setConnectionInfo({ ip: tempIp, port: tempPort }));
                dispatch(setConnectionStatus(true));
                
                Toast.show({
                    type: 'success',
                    text1: 'Connexion réussie!'
                });
            } else {
                // Si le serveur renvoie un autre statut
                Toast.show({
                    type: 'error',
                    text1: 'Réponse inattendue du serveur.',
                });
            }
        } catch (error) {
            // En cas d'erreur de connexion
            Toast.show({
                type: 'error',
                text1: 'Erreur de connexion',
                text2: error.message
            });
        }
    };

    return (
        <View style={styles.container}>
            <TextInput 
                placeholder="Adresse IP"
                value={tempIp}
                onChangeText={setTempIp}  // Mise à jour de l'état local tempIp
                style={styles.input}
            />
            <TextInput 
                placeholder="Port"
                value={tempPort}
                onChangeText={setTempPort}  // Mise à jour de l'état local tempPort
                keyboardType="number-pad"
                style={styles.input}
            />
            <Button title="Tester la connexion" onPress={handleTestConnection} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 20
    },
    input: {
        padding: 10,
        borderColor: 'gray',
        borderWidth: 1,
        marginBottom: 20,
        borderRadius: 5
    }
});

export default HomeScreen;
