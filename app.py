from flask import Flask, Response, render_template, request, json
from PIL import Image
from flask_mysqldb import MySQL
from ultralytics import YOLO
import datetime

app = Flask(__name__)
app.static_folder = 'static'

# Configuring MySQL
app.config['MYSQL_HOST'] = 'localhost'
app.config['MYSQL_USER'] = 'root'
app.config['MYSQL_PASSWORD'] = ''
app.config['MYSQL_DB'] = 'citruss'
mysql = MySQL(app)

# Route to render home page
@app.route("/")
def home():
    try:
        koneksi = mysql.connection.cursor()
        koneksi.execute("SELECT * FROM hasil")
        data = koneksi.fetchall()
        koneksi.close()
        return render_template("index.html", citrus=data)
    except Exception as e:
        return Response(json.dumps({"error": str(e)}), status=500, mimetype='application/json')

# Route to handle object detection
@app.route("/detect", methods=["POST"])
def detect():
    try:
        buf = request.files["image_file"]
        boxes = detect_objects_on_image(Image.open(buf.stream))
        
        # Get the current date and timestamp
        current_datetime = datetime.datetime.now()
        current_date = current_datetime.strftime('%Y-%m-%d')
        current_time = current_datetime.strftime('%H:%M:%S')

        jumlah = len(boxes)

        # Determine freshness or rottenness based on the number of detected objects
        kualitas = determine_quality(boxes)

        # Insert the data into the database
        koneksi = mysql.connection.cursor()
        koneksi.execute("INSERT INTO hasil (tanggal, waktu, jumlah, kualitas) VALUES (%s, %s, %s, %s)",
                        (current_date, current_time, jumlah, kualitas))
        mysql.connection.commit()
        koneksi.close()

        return Response(
            json.dumps({"boxes": boxes, "tanggal": current_date, "waktu": current_time, "jumlah": jumlah, "kualitas": kualitas}),
            mimetype='application/json'
        )
    except Exception as e:
        # Handle exceptions appropriately
        return Response(json.dumps({"error": str(e)}), status=500, mimetype='application/json')

# Function to detect objects on an image
def detect_objects_on_image(image):
    model = YOLO("model/best.pt")
    results = model(image, conf=0.8)
    results = results[0]
    output = []
    for box in results.boxes:
        x1, y1, x2, y2 = [round(x) for x in box.xyxy[0].tolist()]
        class_id = box.cls[0].item()
        prob = round(box.conf[0].item(), 2)
        output.append([x1, y1, x2, y2, results.names[class_id], prob])
    return output

# Function to determine the quality of citrus fruits
def determine_quality(boxes):
    # Adjust this threshold as needed
    freshness_threshold = 5
    
    # Determine freshness or rottenness based on the number of detected objects
    if len(boxes) >= freshness_threshold:
        quality = "rotten"
    else:
        quality = "fresh"
    return quality

# Run the application
if __name__ == "__main__":
    app.run(debug=True)
