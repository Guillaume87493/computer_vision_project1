import cv2
import numpy as np
import base64
import mediapipe as mp
from mediapipe.python.solutions import hands as mpHands
from mediapipe.python.solutions import drawing_utils as mpDraw
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import math
import time
from pycaw.pycaw import AudioUtilities


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Snellere configuratie voor MediaPipe
hands = mpHands.Hands(
    static_image_mode=False,
    max_num_hands=1,            # 1 hand is sneller dan 2
    min_detection_confidence=0.4, 
    min_tracking_confidence=0.4
)




def getLmList(img):
    lmList = []
    rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    results = hands.process(rgb)

    # Controleer of er daadwerkelijk handen gedetecteerd zijn
    if results.multi_hand_landmarks:
        for handLms in results.multi_hand_landmarks:
            # Teken de landmarks op de afbeelding
            mpDraw.draw_landmarks(img, handLms, mpHands.HAND_CONNECTIONS)

            for id, lm in enumerate(handLms.landmark):
                h, w, c = img.shape
                cx, cy = int(lm.x * w), int(lm.y * h)
                lmList.append([cx, cy, id])

    return lmList, img

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    prev_time = 0

    device = AudioUtilities.GetSpeakers()
    volume = device.EndpointVolume

    volume.SetMasterVolumeLevel(-65.0, None) # 0 is 100 vulome en -65.25 is 0

    volRange = volume.GetVolumeRange()

    minVolume = volRange[0]
    maxVol = volRange[1]
    try:
        while True:
            data = await websocket.receive_text()
            if "," in data:
                # Splits de tekst één keer op de komma. 
                # De 'header' is bijv. "data:image/jpeg;base64", de 'encoded' is de lange code van de foto zelf.
                header, encoded = data.split(",", 1)
                
                # Zet de Base64-tekst om naar ruwe binaire data (eentjes en nulletjes)
                image_bytes = base64.b64decode(encoded)
                
                # Maak van de binaire data een platte lijst (array) van getallen (pixels)
                np_array = np.frombuffer(image_bytes, np.uint8)
                
                # 'Decodeer' deze lijst naar een echt OpenCV-beeld (matrix) zodat we de hand kunnen zoeken
                img = cv2.imdecode(np_array, cv2.IMREAD_COLOR)

                if img is not None:
                    h,w,s = img.shape

                    cur_time = time.time()
                    vertraaging = cur_time - prev_time  # Hoe lang duurde het vorige frame?
                    fps = 1 / vertraaging if vertraaging > 0 else 0
                    prev_time = cur_time
                    # AI Verwerking
                    
                    lmList, img = getLmList(img)
                    if len(lmList) != 0:
                        # 1. Bereken afstand
                        x1, y1 = lmList[4][0], lmList[4][1]
                        x2, y2 = lmList[8][0], lmList[8][1]
                        afstand = math.hypot(x2 - x1, y2 - y1)

                        # 2. Gebruik SCALAR (0.0 tot 1.0) in plaats van decibels
                        # Dit zorgt ervoor dat 50% op je scherm ook 50% in Windows is
                        vol_percentage = np.interp(afstand, [30, 220], [0.0, 1.0])
                        
                        # Gebruik SetMasterVolumeLevelScalar voor een lineaire ervaring
                        volume.SetMasterVolumeLevelScalar(vol_percentage, None)

                        # 3. Visuele balk (gebruik h voor dynamische hoogte)
                        balk_bodem = int(h * 0.8)
                        balk_top = int(h * 0.2)
                        
                        # Bereken waar de groene vulling moet stoppen
                        vol_balk_y = np.interp(vol_percentage, [0.0, 1.0], [balk_bodem, balk_top])
                        
                        # Teken visuals
                        cv2.rectangle(img, (20, balk_top), (50, balk_bodem), (255, 255, 255), 2)
                        cv2.rectangle(img, (20, int(vol_balk_y)), (50, balk_bodem), (0, 255, 0), cv2.FILLED)
                        cv2.putText(img, f'{int(vol_percentage * 100)}%', (15, balk_bodem + 40), 
                                    cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
                    
                    img = cv2.flip(img,1)
                    # ALTIJD TERUGSTUREN (ook zonder hand)
                    # Gebruik lagere kwaliteit (70) om netwerk-vertraging te voorkomen
                    _, buffer = cv2.imencode('.jpg', img, [cv2.IMWRITE_JPEG_QUALITY, 70])
                    processed_b64 = base64.b64encode(buffer).decode('utf-8')
                    await websocket.send_text(f"data:image/jpeg;base64,{processed_b64}")
                    
    except WebSocketDisconnect:
        pass
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8801)
