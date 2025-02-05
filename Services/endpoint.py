from flask import Flask, request, jsonify, send_file, send_from_directory
from yt_dlp import YoutubeDL
import os

app = Flask(__name__)

@app.route('/api/download', methods=['POST'])
def download_video():
    data = request.get_json()
    video_url = data.get('url')

    if not video_url:
        return jsonify({'error': 'No URL provided'}), 400

    try:
        options = {
            'format': 'bestaudio/best',  # You can change this to 'bestvideo+bestaudio' for MP4
            'postprocessors': [{
                'key': 'FFmpegExtractAudio',
                'preferredcodec': 'mp3',
                'preferredquality': '192',
            }],
            'outtmpl': 'downloads/%(title)s.%(ext)s',  # Save in a "downloads" folder
            'ffmpeg_location': r'C:\Users\xivo\Documents\ffmpeg\ffmpeg-n7.1-latest-win64-gpl-7.1\bin',  # Correct FFmpeg path
            'ffprobe_location': r'C:\Users\xivo\Documents\ffmpeg\ffmpeg-n7.1-latest-win64-gpl-7.1\bin',  # Correct FFprobe path
        }

        with YoutubeDL(options) as ydl:
            info = ydl.extract_info(video_url, download=True)
            filename = ydl.prepare_filename(info).replace('.webm', '.mp3').replace('.m4a', '.mp3')

        return jsonify({'success': True, 'filename': filename})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/file/<filename>', methods=['GET'])
def get_file(filename):
    print(f"Request for file: {filename}")  # Log the incoming request
    
    # Remove "downloads\\" from the filename
    filename = filename.replace('downloads\\', '')
    
    directory = r'C:\Users\xivo\Desktop\YoutubeConverter\downloads'  # Correct downloads folder path
    try:
        # Using send_from_directory to serve the file correctly
        return send_from_directory(directory, filename, as_attachment=True)
    except Exception as e:
        return jsonify({'error': str(e)}), 404


if __name__ == '__main__':
    # Ensure the "downloads" folder exists
    if not os.path.exists(r'C:\Users\xivo\Desktop\YoutubeConverter\downloads'):
        os.makedirs(r'C:\Users\xivo\Desktop\YoutubeConverter\downloads')  # Correct path to downloads folder
    # Run the Flask app, allowing external connections on the local network
    app.run(host='0.0.0.0', port=5000, debug=True)
