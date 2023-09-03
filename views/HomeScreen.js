import React, { useState } from 'react';  
import { useNavigation } from '@react-navigation/native'; 
import { View, TextInput, StyleSheet, Text, TouchableOpacity } from 'react-native';  
import { useDispatch } from 'react-redux';  // Import des hooks Redux
import axios from 'axios';  // Import d'Axios pour les appels HTTP
import Toast from 'react-native-toast-message'; 
import MusicNotesSvg from '../assets/musicNotessvg';


// Import des actions de Redux
import { setConnectionInfo, setConnectionStatus } from '../redux/connectionSlice';

const HomeScreen = () => {
  const dispatch = useDispatch();  // Hook Redux pour dispatch (envoyer) des actions
  //const { ip, port } = useSelector(state => state.connection);  // Hook Redux pour sélectionner l'ip et le port du state

  // État local pour l'IP et le port temporaires
  const [tempIp, setTempIp] = useState('');
  const [tempPort, setTempPort] = useState('');
  const navigation = useNavigation();

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
        // Redirige vers l'écran Record après une connexion réussie
        navigation.navigate('Record');
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
      <View style={styles.messageContainer}>
        <Text style={styles.highlightedText}>Bienvenue sur Rave !</Text>
      </View>
      <View style={styles.musicSvg}>
        <MusicNotesSvg />
      </View>
      <View style={styles.messageContainer}>
        <Text style={styles.welcomeMessage}>Pour te connecter au serveur et transformer ton audio, merci de rentrer ton adresse IP et ton Port !</Text>
      </View>
      <View style={styles.messageContainer}>
        <Text style={styles.highlightedText}>Amuse toi bien !</Text>
      </View>
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
      <TouchableOpacity style={styles.testButton} onPress={handleTestConnection}>
        <Text style={styles.testButtonText}>Tester la connexion</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    backgroundColor: '#F5F5F5'
  },
  input: {
    padding: 10,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 20,
    borderRadius: 5,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2
  },
  welcomeMessage: {
    marginBottom: 40,   
    fontSize: 18,       
    textAlign: 'center',
    color: '#333',
    fontWeight: '600', 
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2
  },
  testButton: {
    backgroundColor: '#007BFF',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2
  },
  testButtonText: {
    color: 'white',
    fontSize: 18,    
    fontWeight: '500'
  },
  highlightedText: {
    fontWeight: 'bold',
    color: '#007BFF',
    fontSize: 24, 
    textAlign: 'center'  
  },

  messageContainer: {
    marginBottom: 10,  
  },
  musicSvg: {
    alignSelf: 'center', 
    width: 200,
    height: 200,
    marginBottom: 20, 
  },


});

export default HomeScreen;
