import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, ActivityIndicator,
  StyleSheet, Alert, TouchableOpacity
} from 'react-native';
import { useSelector } from 'react-redux';
import axios from 'axios';
import * as FileSystem from 'expo-file-system';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';

const RaveScreen = () => {
  // État local pour gérer les données et la logique
  const [models, setModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState(null);
  const [selectedRecording, setSelectedRecording] = useState(null);
  const [transformedAudioUri, setTransformedAudioUri] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [sound, setSound] = useState();

  // Utilisation des sélecteurs pour obtenir des données du store Redux
  const recordings = useSelector(state => state.recordings);
  const connectionState = useSelector(state => state.connection);

  // useEffect pour gérer la récupération des modèles à partir du serveur
  useEffect(() => {
    let isMounted = true; 

    if (connectionState.isConnected && connectionState.ip && connectionState.port) {
      setIsLoading(true);
      axios.get(`http://${connectionState.ip}:${connectionState.port}/getmodels`)
        .then(response => {
          if (response.data && Array.isArray(response.data.models) && isMounted) {
            setModels(response.data.models);
            setIsLoading(false);
          } else if (isMounted) {
            console.error("Erreur: la structure de la réponse du serveur est inattendue:", response.data);
            setModels([]);
            setIsLoading(false);
          }
        })
        .catch(error => {
          if (isMounted) {
            console.error("Erreur lors de la récupération des modèles:", error);
            setIsLoading(false);
          }
        });
    }

    return () => {
      isMounted = false;
    };
  }, [connectionState]);

  // Fonction pour lire le son
  const playSound = async (uri) => {
    const { sound } = await Audio.Sound.createAsync({ uri });
    setSound(sound);
    await sound.playAsync();
  };

  // Adresse du serveur pour les requêtes
  const serverAdress = `http://${connectionState.ip}:${connectionState.port}`;

  // Fonction pour télécharger le fichier depuis le serveur
  const downloadFile = async () => {
    let directory = FileSystem.documentDirectory + "my_directory"; 
    await FileSystem.makeDirectoryAsync(directory, { intermediates: true }); 
    const { uri } = await FileSystem.downloadAsync(serverAdress + "/download", directory + "/transformed_audio.wav");
    setTransformedAudioUri(uri);
  };

  // Fonction pour envoyer le fichier au serveur
  const sendFile = async () => {
    if (!selectedRecording || !selectedModel) {
      Alert.alert("Erreur", "S'il vous plaît, sélectionnez un enregistrement et un modèle avant de procéder.");
      return;
    }
    setIsLoading(true);
    try {
      await axios.get(`${serverAdress}/selectModel/${selectedModel}`);
      let fileUri = selectedRecording.uri;
      let resp = await FileSystem.uploadAsync(serverAdress + "/upload", fileUri, {
        fieldName: 'file',
        httpMethod: 'POST',
        uploadType: FileSystem.FileSystemUploadType.MULTIPART,
        headers: { 'filename': fileUri.split('/').pop() }
      });
      if (resp.status !== 200) {
        throw new Error("Erreur lors de l'envoi du fichier.");
      }
      await downloadFile();
      setIsLoading(false);
    } catch (error) {
      console.error("Erreur pendant le traitement:", error);
      setIsLoading(false);
      Alert.alert("Erreur", "Une erreur est survenue lors du traitement de l'audio.");
    }
  };

  // useEffect pour libérer la ressource audio lorsqu'elle n'est plus utilisée
  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);


  // Afficher le loader de chargement si nécessaire
  if (isLoading) {
    return <ActivityIndicator size="large" color="#6200ee" />;
  }

  return (
    <View style={{ flex: 1 }}>
      <Text style={styles.header}>Rave</Text>
      <Text style={[styles.connectionStatus, { color: connectionState.isConnected ? 'green' : 'red' }]}>
        {connectionState.isConnected ? 'Connecté au serveur' : 'Déconnecté du server'}
      </Text>
      
      <FlatList
        data={recordings}
        keyExtractor={(item, index) => item.name + index}
        renderItem={({ item }) => (
          <View style={styles.listItem}>
            <Text style={styles.listItemText}>{item.name}</Text>
            <TouchableOpacity style={styles.selectButton} onPress={() => setSelectedRecording(item)}>
              <Ionicons name="send" size={20} color="white" />
              <Text style={styles.selectButtonText}>Sélectionner</Text>
              {selectedRecording === item && <Ionicons name="checkmark" size={20} color="green" style={{ marginLeft: 5 }} />}
            </TouchableOpacity>
          </View>
        )}
      />
      <Text style={styles.modelsHeader}>Choisissez parmis ces modeles :</Text>
    
      <View style={styles.modelsContainer}>
        {models.map((model, index) => (
          <TouchableOpacity
            key={index}
            style={[
              selectedModel === model 
                ? styles.selectedModelButton 
                : styles.modelButton,
              { opacity: selectedModel === model ? 0.6 : 1 }
            ]}
            onPress={() => setSelectedModel(model)}
          >
            <Ionicons name="musical-note" size={20} color="white" style={{ marginRight: 5 }} />
            <Text style={styles.modelButtonText}>{model}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <TouchableOpacity style={styles.sendButton} onPress={sendFile}>
        <Ionicons name="rocket" size={20} color="white" />
        <Text style={styles.sendButtonText}>Envoyer au serveur pour traitement</Text>
      </TouchableOpacity>


      <View style={styles.playButtonsContainer}>
        <TouchableOpacity style={styles.playButton} onPress={() => playSound(selectedRecording?.uri)}>
          <Ionicons name="headset" size={20} color="white" />
          <Text style={styles.playButtonText}>Écouter Original</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.playButtonTransformed} onPress={() => playSound(transformedAudioUri)}>
          <Ionicons name="headset" size={20} color="white" />
          <Text style={styles.playButtonText}>Écouter Transformé</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 10
  },
  connectionStatus: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 10
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderColor: 'grey',
    backgroundColor: 'white',
    borderRadius: 5,
    marginVertical: 5,
    width: '90%',
    alignSelf: 'center',
    elevation: 1, 
    shadowOffset: { width: 1, height: 1 },
    shadowColor: 'black',
    shadowOpacity: 0.3,
  },
  listItemText: {
    fontSize: 16
  },
  modelsHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 5,
    padding: 10,
    borderRadius: 5,
  },
    
  modelsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 10
  },
  modelButton: {
    padding: 10,
    backgroundColor: '#6200ee',
    margin: 5,
    borderRadius: 5,
    elevation: 2,
    shadowOffset: { width: 2, height: 2 },
    shadowColor: 'black',
    shadowOpacity: 0.3,
  },
  selectedModelButton: {
    padding: 10,
    backgroundColor: '#6200ee',
    margin: 5,
    borderRadius: 5,
    elevation: 8, 
    shadowOffset: { width: 4, height: 4 },
    shadowColor: 'black',
    shadowOpacity: 0.4,
  },
  modelButtonText: {
    color: 'white'
  },
  playButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    marginTop: 20
  },
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#47AAB7', 
    borderRadius: 5,
    elevation: 2,
    shadowOffset: { width: 2, height: 2 },
    shadowColor: 'black',
    shadowOpacity: 0.3,
  },
  selectButtonText: {
    color: 'white',
    marginLeft: 5,
  },
  sendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    backgroundColor: '#4A90E2',
    borderRadius: 5,
    elevation: 3,
    shadowOffset: { width: 2, height: 2 },
    shadowColor: 'black',
    shadowOpacity: 0.3,
    marginTop: 10
  },
  sendButtonText: {
    color: 'white',
    marginLeft: 5
  },
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#47AAB7',
    borderRadius: 5,
    marginHorizontal: 10,
    elevation: 2,
    shadowOffset: { width: 2, height: 2 },
    shadowColor: 'black',
    shadowOpacity: 0.3,
  },
  playButtonText: {
    color: 'white',
    marginLeft: 5,
  },
  playButtonTransformed: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#000000', 
    borderRadius: 5,
    marginHorizontal: 10,
    elevation: 2,
    shadowOffset: { width: 2, height: 2 },
    shadowColor: 'black',
    shadowOpacity: 0.3,
  },
});
  
export default RaveScreen;
