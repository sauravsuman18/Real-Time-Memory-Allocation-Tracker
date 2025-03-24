from flask import Flask, render_template
from flask_socketio import SocketIO
import psutil
import time
import threading

# Create the Flask application
app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")

@app.route('/')
def home():
    """Render the homepage."""
    return render_template('index.html')

def get_memory_details():
    """Fetch memory usage details and return them as a dictionary."""
    mem_data = psutil.virtual_memory()
    return {
        'total': mem_data.total // (1024 * 1024),  # Convert to MB
        'used': mem_data.used // (1024 * 1024),
        'free': mem_data.free // (1024 * 1024),
        'percent': mem_data.percent
    }

def send_memory_info():
    """Continuously sends memory stats to the client every second."""
    while True:
        mem_snapshot = get_memory_details()
        print(f"[DEBUG] Memory Info Sent: {mem_snapshot}")  # Added debug print
        socketio.emit('memory_update', mem_snapshot)
        time.sleep(1)  # Wait for 1 second before sending again

def start_background_worker():
    """Start the memory tracking function in a separate thread."""
    tracking_thread = threading.Thread(target=send_memory_info, daemon=True)
    tracking_thread.start()

@socketio.on('connect')
def on_connect():
    """Start tracking memory when a client connects."""
    print("[INFO] A client connected. Starting memory tracking...")
    start_background_worker()

if __name__ == '__main__':
    socketio.run(app, debug=True)
