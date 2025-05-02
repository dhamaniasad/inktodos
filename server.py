from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse, FileResponse
from fastapi.templating import Jinja2Templates
import uvicorn
import os

# Create the FastAPI app
app = FastAPI(title="InkTodos Server")

# Mount the static files directory
app.mount("/css", StaticFiles(directory="css"), name="css")
app.mount("/js", StaticFiles(directory="js"), name="js")

# Define routes
@app.get("/", response_class=HTMLResponse)
async def read_index():
    return FileResponse("index.html")

@app.get("/about", response_class=HTMLResponse)
async def read_about():
    return FileResponse("about.html")

@app.get("/health")
async def health_check():
    return {"status": "ok"}

# Run the server
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("server:app", host="0.0.0.0", port=port, reload=True)