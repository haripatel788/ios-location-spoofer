from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import subprocess

app = FastAPI()

# allow the react frontend to communicate with this api
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ... (keep all your existing active_process and endpoint code exactly the same below this)

# track the active spoofing tunnel
active_process = None

class LocationData(BaseModel):
    lat: float
    lng: float

@app.post("/api/update-location")
def update_location(data: LocationData):
    global active_process
    
    try:
        # kill any existing process before starting a new one
        if active_process:
            active_process.terminate()
            active_process = None
            
        print(f"starting spoofing tunnel for {data.lat}, {data.lng}")
        
        command = [
            "python3", "-m", "pymobiledevice3", 
            "developer", "dvt", "simulate-location", "set", 
            "--", str(data.lat), str(data.lng)
        ]
        
        # launch the process in the background using popen
        active_process = subprocess.Popen(
            command, 
            stdout=subprocess.PIPE, 
            stderr=subprocess.PIPE
        )
        
        return {"status": "success", "message": "location tunnel established"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/reset-location")
def reset_location():
    global active_process
    
    try:
        # close the background tunnel safely
        if active_process:
            active_process.terminate()
            active_process = None
            
        # clear the spoofed coordinates from the device
        subprocess.run([
            "python3", "-m", "pymobiledevice3", 
            "developer", "dvt", "simulate-location", "clear"
        ])
        
        return {"status": "success", "message": "location reset to normal"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))