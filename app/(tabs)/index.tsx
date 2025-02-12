import * as FileSystem from 'expo-file-system';
import React, { useState } from 'react';
import { View, TextInput, Button, FlatList, Text, Image, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import * as MediaLibrary from 'expo-media-library'; // For saving to media library (like Downloads)

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#ffffff',
    },
    input: {
        height: 40,
        borderColor: '#cccccc',
        borderWidth: 1,
        marginBottom: 12,
        paddingHorizontal: 8,
        backgroundColor: '#f9f9f9',
        marginTop: 30,
    },
    videoItem: {
        flexDirection: 'row',
        marginBottom: 12,
    },
    thumbnail: {
        width: 120,
        height: 90,
        marginRight: 8,
    },
    videoInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000000',
    },
    description: {
        fontSize: 14,
        color: '#606060',
    },
    status: {
        marginTop: 16,
        fontSize: 16,
    },
});

const YouTubeSearch = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [status, setStatus] = useState('');
    const [selectedVideo, setSelectedVideo] = useState(null);
    

    const searchYouTube = async () => {
        const apiKey = 'AIzaSyDb7SDhbU3yhjABTPXgEfcHFwISoGCqi2M';
        const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${query}&type=video&maxResults=10&key=${apiKey}`;
        try {
            const response = await fetch(url);
            const data = await response.json();
            setResults(data.items || []);
        } catch (error) {
            console.error("error1" + error);
        }
    };

    const handlePress = (videoId, title) => {
        setSelectedVideo({ videoId, title });
    };

    const handleDownload = async () => {
        if (!selectedVideo) return;
    
        setStatus('Processing...');
        try {
            const response = await fetch('http://192.168.1.162:5000/api/download', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: `https://www.youtube.com/watch?v=${selectedVideo.videoId}` }),
            });
    
            const blob = await response.blob();
            const fileUri = FileSystem.documentDirectory + selectedVideo.title + '.mp3';  // Save in internal storage
            const { uri } = await FileSystem.downloadAsync(response.url, fileUri);
            console.log("File downloaded to: " + uri);
            await MediaLibrary.createAssetAsync(uri);
            await MediaLibrary.getAlbumAsync('Download');
            setStatus('Download complete!');
            Alert.alert('Download complete', 'The MP3 file has been saved to your device.');
        } catch (error) {
            setStatus(`Error: ${error}`);
        }
    };

    return (
        <View style={styles.container}>
            <TextInput
                style={styles.input}
                placeholder="Search YouTube"
                value={query}
                onChangeText={setQuery}
            />
            <Button title="Search" onPress={searchYouTube} color="#ff0000" />

            <FlatList
                data={results}
                keyExtractor={(item) => item.id.videoId}
                renderItem={({ item }) => (
                    <TouchableOpacity onPress={() => handlePress(item.id.videoId, item.snippet.title)}>
                        <View style={styles.videoItem}>
                            <Image
                                style={styles.thumbnail}
                                source={{ uri: item.snippet.thumbnails.default.url }}
                            />
                            <View style={styles.videoInfo}>
                                <Text style={styles.title}>{item.snippet.title}</Text>
                                <Text style={styles.description}>{item.snippet.description}</Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                )}
            />

            {selectedVideo && (
                <View>
                    <Text style={styles.status}>Selected video: {selectedVideo.title}</Text>
                    <Button title="Download MP3" onPress={handleDownload} color="#ff0000" />
                    <Text style={styles.status}>{status}</Text>
                </View>
            )}
        </View>
    );
};

export default YouTubeSearch;
