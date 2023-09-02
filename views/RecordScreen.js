import React, { useState } from 'react';
import { View, TouchableOpacity, TextInput, FlatList, Text, StyleSheet } from 'react-native';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { addRecording, deleteRecording } from '../redux/recordingsSlice';

const RecordScreen = () => {
  // Utilisation des hooks Redux pour accéder et modifier l'état global
  const dispatch = useDispatch();
  const recordings = useSelector(state => state.recordings);

  // Déclaration des états locaux
  const [recording, setRecording] = useState(); // Référence à l'enregistrement actuel
  const [isRecording, setIsRecording] = useState(false); // Indique si l'appareil enregistre actuellement
  const [name, setName] = useState(''); // Nom de l'enregistrement
  const [sound, setSound] = useState(); // Référence au fichier audio pour la lecture
  const [isPlaying, setIsPlaying] = useState(false); // Indique si un enregistrement est en cours de lecture
  const [currentPlayingUri, setCurrentPlayingUri] = useState(null); // URI de l'enregistrement en cours de lecture
  const [currentRecording, setCurrentRecording] = useState(); // Référence à l'enregistrement actuellement en cours

  // Fonction pour démarrer l'enregistrement
  const startRecording = async () => {
    try {
      await Audio.requestPermissionsAsync();
      const { recording } = await Audio.Recording.createAsync(
        Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY
      );
      setRecording(recording);
      setIsRecording(true);
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  };

  // Fonction pour arrêter l'enregistrement
  const stopRecording = async () => {
    setIsRecording(false);
    await recording.stopAndUnloadAsync();
    setCurrentRecording(recording); 
  };

  // Fonction pour lire un enregistrement
  const playRecording = async (uri) => {
    if (sound && isPlaying && currentPlayingUri === uri) {
      await sound.pauseAsync();
      setIsPlaying(false);
      return;
    }
    if (sound && !isPlaying && currentPlayingUri === uri) {
      await sound.playAsync();
      setIsPlaying(true);
      return;
    }
    if (sound) {
      await sound.unloadAsync();
      setSound(undefined);
      setIsPlaying(false);
    }
    try {
      const { sound: newSound } = await Audio.Sound.createAsync({ uri: uri });
      newSound.setOnPlaybackStatusUpdate(playbackStatusUpdate);
      setSound(newSound);
      setCurrentPlayingUri(uri);
      await newSound.playAsync();
      setIsPlaying(true);
    } catch (error) {
      console.error("Erreur lors du chargement ou de la lecture du son:", error);
    }
  };

  // Fonction pour sauvegarder un enregistrement
  const saveRecording = async () => {
    if (!currentRecording) {
      console.error("Aucun enregistrement n'a été trouvé.");
      return;
    }
    const uri = currentRecording.getURI();
    if (!name || name.trim().length === 0) {
      alert("Veuillez donner un nom à votre enregistrement avant de le sauvegarder.");
      return;
    }
    const nameExists = recordings.some(item => item.name === name);
    if (nameExists) {
      alert("Un enregistrement avec ce nom existe déjà. Veuillez choisir un autre nom.");
      return;
    }
    const uniqueName = name;
    let newUri = FileSystem.documentDirectory + uniqueName + '.m4a';
    let fileInfo = await FileSystem.getInfoAsync(newUri);
    if (fileInfo.exists) {
      let counter = 1;
      while (fileInfo.exists && counter < 100) { 
        const adjustedName = `${uniqueName}(${counter}).m4a`;
        newUri = FileSystem.documentDirectory + adjustedName;
        fileInfo = await FileSystem.getInfoAsync(newUri);
        counter++;
      }
    }
    await FileSystem.moveAsync({
      from: uri,
      to: newUri
    });
    const newRecording = {
      name: uniqueName,
      uri: newUri
    };
    dispatch(addRecording(newRecording));
    setName('');
    setRecording(undefined);
  };

  // Fonction pour suivre l'état de la lecture
  const playbackStatusUpdate = (status) => {
    if (!status.isLoaded) {
      if (status.error) {
        console.error(`Erreur de lecture : ${status.error}`);
      }
    } else {
      if (status.didJustFinish) {
        setIsPlaying(false);
        setCurrentPlayingUri(null);
      }
    }
  };

  // Fonction pour arrêter la lecture
  const stopPlayback = async () => {
    if (sound) {
      sound.setOnPlaybackStatusUpdate(null);
      await sound.stopAsync();
      setSound(undefined);
      setIsPlaying(false);
      setCurrentPlayingUri(null);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.readyText}>Prêt pour enregistrer un son?</Text>

      {/* Section d'enregistrement */}
      <TouchableOpacity 
        style={[styles.recordButton, {backgroundColor: isRecording ? '#E74C3C' : '#6883F5'}]}
        onPress={isRecording ? stopRecording : startRecording} 
      >
        <Ionicons 
          name={isRecording ? "mic-off" : "mic"} 
          size={50} 
          color="white"
        />
        <Text style={styles.recordButtonText}>{isRecording ? "Stop" : "Start Recording"}</Text>
      </TouchableOpacity>

      {currentRecording && (
        <TouchableOpacity 
          style={[styles.playbackButton, styles.playbackContainer]} 
          onPress={() => playRecording(currentRecording.getURI())}
        >
          <Ionicons 
            name={currentPlayingUri === currentRecording.getURI() && isPlaying ? "pause" : "play"} 
            size={32} 
            color="#2C3E50"
          />
          <Text style={styles.playbackButtonText}>Lecture de votre enregistrement en cours</Text>
        </TouchableOpacity>
      )}
      <View style={styles.controlPanel}>
        <TextInput 
          placeholder="Nommez votre enregistrement"
          value={name}
          onChangeText={setName}
          style={styles.textInput}
        />
        <View style={styles.warningContainer}>
          <Ionicons name="information-circle-outline" size={24} color="#34495E" />
          <Text style={styles.warningText}>
            Si vous ne sauvegardez pas votre enregistrement avant d&apos;en recommencer un autre, celui-ci sera perdu.
          </Text>
        </View>

        <TouchableOpacity 
          style={[styles.saveButton, {backgroundColor: '#21a635'}]} 
          onPress={saveRecording}     
        >
          <Ionicons name="save" size={20} color="white" />
          <Text style={styles.saveButtonText}>Sauvegarder</Text>
        </TouchableOpacity>
            
        {/* Ligne de séparation */}
        <View style={styles.separator}></View>

      </View>
      {/* Section de lecture */}
      <Text style={styles.sectionHeader}>Mes enregistrements</Text>
      <FlatList
        data={recordings}
        keyExtractor={(item, index) => item.name + index}
        renderItem={({ item }) => (
          <View style={styles.listItem}>
            <Text style={styles.listItemText}>{item.name}</Text>
            <Ionicons
              name={currentPlayingUri === item.uri && isPlaying ? "pause" : "play"}
              size={32}
              color="green"
              onPress={() => playRecording(item.uri)} 
            />
            <Ionicons
              name="stop"
              size={32}
              color="red"
              onPress={stopPlayback} 
            />
            <Ionicons
              name="trash"
              size={32}
              color="red"
              onPress={async () => {
                await FileSystem.deleteAsync(item.uri);
                dispatch(deleteRecording(item.name));
              }} 
            />
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5'
  },
  sectionHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    color: '#34495E'
  },
  
  recordButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 30,
    margin: 10
  },
  recordButtonText: {
    marginLeft: 10,
    color: 'white',
    fontWeight: 'bold',
  },
  readyText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#34495E'
  },
  
  controlPanel: {
    width: '90%',
    alignItems: 'center',
  },
  textInput: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    marginTop: 10,
    padding: 10,
    width: '100%',
    backgroundColor: 'white'
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    padding: 10,
    marginTop: 10,
    width: '80%'
  },
  saveButtonText: {
    marginLeft: 5,
    color: 'white',
    fontWeight: 'bold'
  },
  playbackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10
  },
  playbackButtonText: {
    color: '#2C3E50',
    fontWeight: 'bold'
  },
  playbackContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    padding: 10,
    marginTop: 10,
    width: '80%',
    borderWidth: 1,
    borderColor: 'black'
  },

  infoText: {
    marginTop: 10,
    color: '#2C3E50',
    textAlign: 'center'
  },
  stopButton: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 50,
    width: 60,
    height: 60,
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
    width: '90%'
  },
  listItemText: {
    fontWeight: 'bold'
  },
  separator: {
    height: 1,
    width: '90%',
    backgroundColor: '#34495E',
    marginVertical: 20
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 10,  
    padding: 5,  
    backgroundColor: '#f5f5f5',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#dcdcdc'
  },
  warningText: {
    marginLeft: 10,  
    color: '#34495E',
    flexWrap: 'wrap', 
    flex: 1  
  }
});

export default RecordScreen;
