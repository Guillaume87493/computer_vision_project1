import os
import sys

# Dit dwingt OpenCV om geen scherm te zoeken
os.environ["QT_QPA_PLATFORM"] = "offscreen"

# Dit helpt Python om de systeem bibliotheken te vinden
os.environ["LD_LIBRARY_PATH"] = ":".join([
    "/usr/lib/x86_64-linux-gnu",
    "/lib/x86_64-linux-gnu",
    os.environ.get("LD_LIBRARY_PATH", "")
])


import cv2
import numpy as np
import base64
import mediapipe as mp
from mediapipe.python.solutions import hands as mpHands
from mediapipe.python.solutions import drawing_utils as mpDraw
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import os

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# MediaPipe Setup
hands = mpHands.Hands(
    static_image_mode=False,
    max_num_hands=2,
    min_detection_confidence=0.5, 
    min_tracking_confidence=0.5
)

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    
    try:
        while True:
            data = await websocket.receive_text()
            
            if data.startswith('data:image'):
                try:
                    header, encoded = data.split(",", 1)
                    image_bytes = base64.b64decode(encoded)
                    img = cv2.imdecode(np.frombuffer(image_bytes, np.uint8), cv2.IMREAD_COLOR)

                    if img is not None:
                        # Verwerking
                        rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
                        results = hands.process(rgb)

                        # Teken landmarks
                        if results.multi_hand_landmarks:
                            for handLms in results.multi_hand_landmarks:
                                mpDraw.draw_landmarks(img, handLms, mpHands.HAND_CONNECTIONS)

                        # Spiegelen voor gebruiksgemak
                        img = cv2.flip(img, 1)

                        # Terugsturen
                        _, buffer = cv2.imencode('.jpg', img, [cv2.IMWRITE_JPEG_QUALITY, 70])
                        processed_b64 = base64.b64encode(buffer).decode('utf-8')
                        await websocket.send_text(f"data:image/jpeg;base64,{processed_b64}")

                except Exception:
                    continue
                    
    except WebSocketDisconnect:
        pass

if __name__ == "__main__":
    # CLOUD CHECK: Gebruik poort 8801 tenzij Railway een poort toewijst
    port = int(os.environ.get("PORT", 8801))
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=port)