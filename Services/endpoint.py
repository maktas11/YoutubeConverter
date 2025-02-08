from flask import Flask, request, jsonify, send_file
from yt_dlp import YoutubeDL
from io import BytesIO
import logging

app = Flask(__name__)

@app.route('/api/download', methods=['POST'])
def download_video():
    data = request.get_json()
    video_url = data.get('url')

    if not video_url:
        return jsonify({'error': 'No URL provided'}), 400

    try:
        options = {
            'format': 'bestaudio/best',  # Prioritize best audio
            'postprocessors': [{
                'key': 'FFmpegExtractAudio',
                'preferredcodec': 'mp3',
                'preferredquality': '192',
            }],
            'ffmpeg_location': r'C:\Users\xivo\Documents\ffmpeg\ffmpeg-n7.1-latest-win64-gpl-7.1\bin',
            'outtmpl': '-',  # Output to memory
            'quiet': True,
            'encoding': 'utf-8',
        }

        with YoutubeDL(options) as ydl:
            info = ydl.extract_info(video_url, download=False)
            
            # Find the first format with a valid URL
            audio_format = next(
                (fmt for fmt in info.get('formats', []) if fmt.get('acodec') != 'none' and 'url' in fmt), 
                None
            )
            
            if not audio_format:
                return jsonify({'error': 'No suitable audio format found'}), 400

            audio_url = audio_format['url']
            filename = f"{info['title']}.mp3"

            # Download audio data into memory
            audio_data = BytesIO()
            response = ydl.urlopen(audio_url)
            audio_data.write(response.read())
            audio_data.seek(0)

            return send_file(audio_data, as_attachment=True, download_name=filename, mimetype='audio/mpeg')

    except Exception as e:
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
