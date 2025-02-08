import { StyleSheet, TextInput, Button, View, Text, Linking, Alert, ScrollView } from 'react-native';
import React, { useState } from 'react';

export default function HomeScreen() {
    const [url, setUrl] = useState('');
    const [status, setStatus] = useState('');
    const [downloadLinks, setDownloadLinks] = useState([]);  // Store multiple download links

    const handleDownload = async () => {
        setStatus('Processing...');
        try {
        const response = await fetch('http://192.168.1.162:5000/api/download', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url }),
        });

        const data = await response.json();

        if (data.success) {
            setStatus('Download ready!');
            const fileUrl = `http://192.168.1.162:5000/api/file/${encodeURIComponent(data.filename)}`;

            // Add the new download link with title to the state
            setDownloadLinks((prevLinks) => [...prevLinks, { title: data.title, url: fileUrl }]);
        } else {
            setStatus(`Error: ${data.error}`);
        }
        } catch (error) {
        setStatus(`Error: ${error}`);
        }
    };

    return (
        <View style={styles.container}>
        <Text style={styles.title}>YouTube Downloader</Text>
        <TextInput
            style={styles.input}
            placeholder="Enter YouTube URL"
            value={url}
            onChangeText={setUrl}
        />
        <Button title="Download" onPress={handleDownload} />
        <Text style={styles.status}>{status}</Text>

        <ScrollView style={styles.linkContainer}>
            {downloadLinks.length > 0 && downloadLinks.map((link, index) => (
            <Text
                key={index}
                style={styles.link}
                onPress={() => Linking.openURL(link.url)} // Link opens when clicked
            >
                {link.title}  {/* Show video title as the download link */}
            </Text>
            ))}
        </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 16,
        marginTop: 100,
        backgroundColor: 'white',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 16,
        backgroundColor: 'white',
    },
    input: {
        borderColor: '#ccc',
        borderWidth: 1,
        padding: 8,
        borderRadius: 4,
        marginBottom: 16,
        backgroundColor: 'white',
    },
    status: {
        marginTop: 16,
        fontSize: 16,
    },
    linkContainer: {
        marginTop: 16,
        marginBottom: 32,
    },
    link: {
        marginTop: 12,
        padding: 12,
        backgroundColor: '#007BFF',
        color: 'white',
        textAlign: 'center',
        borderRadius: 4,
        fontSize: 16,
        textDecorationLine: 'none',
    },
});
