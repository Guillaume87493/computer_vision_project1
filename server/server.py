import cv2
import numpy as np
import base64
import json
import os
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from ultralytics import YOLO

app = FastAPI()

# CORS instellingen zodat je frontend altijd verbinding mag maken
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# 1. SETUP & MODEL
model = YOLO('yolov8n.pt') 
FILE_PATH = 'point.json'

parkeerGeheugen = []
huidigVak = []
frame_count = 0

# Laad bestaande vakken in bij opstarten
def load_stored_data():
    global parkeerGeheugen
    if os.path.exists(FILE_PATH):
        try:
            with open(FILE_PATH, 'r') as f:
                data = json.load(f)
                if isinstance(data, list):
                    return data
        except:
            pass
    return []

parkeerGeheugen = load_stored_data()

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    global huidigVak, parkeerGeheugen, frame_count
    await websocket.accept()
    print("WebSocket verbinding geopend")
    
    laatste_bezet_indices = []

    try:
        while True:
            data = await websocket.receive_text()

            # A. JSON VERWERKING (Clicks & Reset)
            if data.startswith('{'):
                msg = json.loads(data)
                m_type = msg.get("type")
                
                if m_type == "click":
                    x, y = msg.get("x"), msg.get("y")
                    # Filter ghost clicks (0,0 of ongeldig)
                    if x is not None and y is not None and (x > 5 or y > 5):
                        huidigVak.append([int(x), int(y)])
                        if len(huidigVak) == 4:
                            parkeerGeheugen.append(huidigVak.copy())
                            huidigVak = []
                            with open(FILE_PATH, 'w') as f:
                                json.dump(parkeerGeheugen, f, indent=4)
                
                elif m_type == "reset":
                    parkeerGeheugen = []
                    huidigVak = []
                    if os.path.exists(FILE_PATH):
                        os.remove(FILE_PATH)
                    print("Systeem gereset.")
                continue

            # B. VIDEO FRAME VERWERKING
            if data.startswith('data:image'):
                frame_count += 1
                
                # Decodeer base64 naar OpenCV beeld
                try:
                    _, encoded = data.split(",", 1)
                    img_bytes = base64.b64decode(encoded)
                    img = cv2.imdecode(np.frombuffer(img_bytes, np.uint8), cv2.IMREAD_COLOR)
                except:
                    continue

                if img is not None:
                    # AI Analyse elke 3 frames (voor snelheid)
                    if frame_count % 3 == 0:
                        nieuwe_bezet_indices = []
                        results = model.track(img, persist=True, classes=[2, 7], verbose=False, imgsz=320)[0]
                        
                        if results.boxes is not None:
                            boxes = results.boxes.xyxy.cpu().numpy()
                            for box in boxes:
                                cx, cy = int((box[0] + box[2]) / 2), int(box[3])
                                for i, vak in enumerate(parkeerGeheugen):
                                    poly = np.array(vak, np.int32)
                                    if cv2.pointPolygonTest(poly, (cx, cy), False) >= 0:
                                        nieuwe_bezet_indices.append(i)
                        laatste_bezet_indices = nieuwe_bezet_indices

                    # Teken opgeslagen vakken
                    for i, vak in enumerate(parkeerGeheugen):
                        poly = np.array(vak, np.int32)
                        is_bezet = i in laatste_bezet_indices
                        kleur = (0, 0, 255) if is_bezet else (0, 255, 0)
                        cv2.polylines(img, [poly], True, kleur, 2)
                        if is_bezet:
                            cv2.putText(img, "BEZET", (vak[0][0], vak[0][1]-10), 
                                        cv2.FONT_HERSHEY_SIMPLEX, 0.5, kleur, 2)

                    # Teken punten van het vak waar je nu mee bezig bent
                    if huidigVak:
                        for p in huidigVak:
                            cv2.circle(img, (p[0], p[1]), 4, (0, 255, 255), -1)

                    # Terugsturen naar frontend
                    _, buffer = cv2.imencode('.jpg', img, [cv2.IMWRITE_JPEG_QUALITY, 50])
                    b64_str = base64.b64encode(buffer).decode('utf-8')
                    await websocket.send_text(f"data:image/jpeg;base64,{b64_str}")

    except WebSocketDisconnect:
        print("Client verbinding verbroken")
    except Exception as e:
        print(f"Server Fout: {e}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8800)

    