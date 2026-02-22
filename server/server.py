import cv2
import numpy as np
import base64
import json
import os
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from ultralytics import YOLO

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ### CLOUD FIX: Pad naar bestanden ###
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
FILE_PATH = os.path.join(BASE_DIR, 'point.json')
MODEL_PATH = os.path.join(BASE_DIR, 'yolov8n.pt')

model = YOLO(MODEL_PATH) 

parkeerGeheugen = []
huidigVak = []
frame_count = 0

def load_stored_data():
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
    
    laatste_bezet_indices = []

    try:
        while True:
            data = await websocket.receive_text()

            if data.startswith('{'):
                msg = json.loads(data)
                m_type = msg.get("type")
                
                if m_type == "click":
                    x, y = msg.get("x"), msg.get("y")
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
                continue

            if data.startswith('data:image'):
                frame_count += 1
                try:
                    _, encoded = data.split(",", 1)
                    img_bytes = base64.b64decode(encoded)
                    img = cv2.imdecode(np.frombuffer(img_bytes, np.uint8), cv2.IMREAD_COLOR)
                except:
                    continue

                if img is not None:
                    # AI Analyse elke 5 frames in cloud (iets trager voor stabiliteit)
                    if frame_count % 5 == 0:
                        nieuwe_bezet_indices = []
                        # imgsz=320 is perfect voor snelheid in de cloud
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
                        print('hallo')

                    for i, vak in enumerate(parkeerGeheugen):
                        poly = np.array(vak, np.int32)
                        is_bezet = i in laatste_bezet_indices
                        kleur = (0, 0, 255) if is_bezet else (0, 255, 0)
                        cv2.polylines(img, [poly], True, kleur, 2)

                    if huidigVak:
                        for p in huidigVak:
                            cv2.circle(img, (p[0], p[1]), 4, (0, 255, 255), -1)

                    _, buffer = cv2.imencode('.jpg', img, [cv2.IMWRITE_JPEG_QUALITY, 40]) # Quality 40 voor snellere stream
                    b64_str = base64.b64encode(buffer).decode('utf-8')
                    await websocket.send_text(f"data:image/jpeg;base64,{b64_str}")

    except WebSocketDisconnect:
        pass
    except Exception as e:
        print(f"Server Fout: {e}")

if __name__ == "__main__":
    import uvicorn
    # ### CLOUD FIX: Gebruik omgevingsvariabele PORT ###
    port = int(os.environ.get("PORT", 8800))
    uvicorn.run(app, host="0.0.0.0", port=port)