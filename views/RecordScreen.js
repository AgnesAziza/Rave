import React, { useState } from 'react';
import { View, TouchableOpacity, TextInput, FlatList, Text, StyleSheet } from 'react-native';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { addRecording, deleteRecording } from '../redux/recordingsSlice';

const RecordScreen = () => {
  // Initialisation des hooks Redux pour la gestion d'état
  const dispatch = useDispatch();
  const recordings = useSelector(state => state.recordings);

  // Initialisation des states locaux
  const [recording, setRecording] = useState(); // Référence à l'enregistrement actuel
  const [isRecording, setIsRecording] = useState(false); // État d'enregistrement
  const [name, setName] = useState(''); // Nom de l'enregistrement actuel
  const [sound, setSound] = useState(); // Référence au son pour la lecture
  const [isPlaying, setIsPlaying] = useState(false); // État de lecture
  const [currentPlayingUri, setCurrentPlayingUri] = useState(null); // URI de l'enregistrement actuellement en lecture

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

  const stopRecording = async () => {
    setIsRecording(false);
    await recording.stopAndUnloadAsync();
  };

  const playRecording = async (uri) => {
    // Si le son est déjà en train d'être joué, le mettre en pause
    if (sound && currentPlayingUri === uri) {
      if (isPlaying) {
        await sound.pauseAsync();
        setIsPlaying(false);
      } else {
        await sound.playAsync();
        setIsPlaying(true);
      }
      return;
    } else if (sound) { // Si un autre son est chargé, le décharger
      await sound.unloadAsync();
    }
  
    // Sinon, charger le son depuis l'URI et le jouer
    try {
      const { sound: newSound } = await Audio.Sound.createAsync({ uri: uri });
      setSound(newSound);
      setIsPlaying(true);
      setCurrentPlayingUri(uri);
      await newSound.playAsync();
    } catch (error) {
      console.error("Erreur lors du chargement ou de la lecture du son:", error);
    }
  };
  

  const stopPlayback = async () => {
    if (sound) {
      await sound.stopAsync();
      setSound(undefined);
      setIsPlaying(false);
      setCurrentPlayingUri(null);
    }
  };

  const saveRecording = async () => {
    const uri = recording.getURI();
    // Vérifications avant de sauvegarder
    if (!name || name.trim().length === 0) {
      alert("Veuillez donner un nom à votre enregistrement avant de le sauvegarder.");
      return;
    }
    const nameExists = recordings.some(item => item.name === name);
    if (nameExists) {
      alert("Un enregistrement avec ce nom existe déjà. Veuillez choisir un autre nom.");
      return;
    }

    // Verification du nom unique pour le fichier
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
    
    // Déplace l'enregistrement vers le nouveau chemin d'accès
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

  // Fonction pour basculer entre la lecture et la pause
  const togglePlayback = async () => {
    if (sound) {
      if (isPlaying) {
        await sound.pauseAsync();
      } else {
        await sound.playAsync();
      }
      setIsPlaying(!isPlaying);
    } else if (recording) {
      await playRecording(recording.getURI());
    }
  };

  return (
    <View style={styles.container}>
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
    
      {!isRecording && (
        <View style={styles.controlPanel}>
          <TextInput 
            placeholder="Nommez votre enregistrement"
            value={name}
            onChangeText={setName}
            style={styles.textInput}
          />
          {recording && (
            <TouchableOpacity style={[styles.saveButton, {backgroundColor: '#21a635'}]} onPress={saveRecording}>
              <Ionicons name="save" size={20} color="white" />
              <Text style={styles.saveButtonText}>Sauvegarder</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.playbackButton} onPress={togglePlayback} disabled={!recording}>
            <Ionicons name={isPlaying ? "pause" : "play"} size={20} color="#2C3E50" />
            <Text style={styles.playbackButtonText}>
              {isPlaying ? "Pause" : (recording ? "Lire l'enregistrement" : "Aucun enregistrement en cours")}
            </Text>
          </TouchableOpacity>
          {isPlaying && 
                        <TouchableOpacity onPress={stopPlayback} style={[styles.stopButton, {marginTop: 10, marginBottom: 10, backgroundColor: '#E74C3C'}]}>
                          <Ionicons name="stop" size={32} color="white" />
                        </TouchableOpacity>}
          {isPlaying && <Text style={styles.infoText}>Veuillez appuyer sur stop pour pouvoir relancer la lecture</Text>}
        </View>
      )}

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
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5'
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
  stopButton: {
    padding: 10
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
  }
});

export default RecordScreen;
