from fastapi import FastAPI, Request, Body, Form
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse, FileResponse, Response
from fastapi.templating import Jinja2Templates
from typing import Dict, List, Any, Optional
from datetime import datetime
import uvicorn
import os
import json

# Create the FastAPI app
app = FastAPI(title="InkTodos Server")

# Mount the static files directory
app.mount("/css", StaticFiles(directory="css"), name="css")
app.mount("/js", StaticFiles(directory="js"), name="js")

# Define routes
@app.get("/", response_class=HTMLResponse)
async def read_index():
    return FileResponse("index.html")

@app.get("/index", response_class=HTMLResponse)
async def read_index_alt():
    return FileResponse("index.html")

@app.get("/index.html", response_class=HTMLResponse)
async def read_index_html():
    return FileResponse("index.html")

@app.get("/about", response_class=HTMLResponse)
async def read_about():
    return FileResponse("about.html")

@app.get("/about.html", response_class=HTMLResponse)
async def read_about_html():
    return FileResponse("about.html")

@app.get("/health")
async def health_check():
    return {"status": "ok"}

@app.post("/api/export")
async def export_tasks(data: str = Form(...)):
    """
    Generate a text file from the tasks data and send it as a downloadable file.
    Expects a form submission with a 'data' field containing JSON.
    """
    try:
        # Parse the JSON string from the form data
        json_data = json.loads(data)
        tasks = json_data.get("tasks", [])
        date_string = json_data.get("date", datetime.now().strftime("%A, %B %d, %Y"))
        
        # Generate the content
        content = f"InkTodos - Tasks for {date_string}\r\n"
        content += "----------------------------------------\r\n\r\n"
        
        for task in tasks:
            status = "[✓]" if task.get("completed", False) else "[ ]"
            rolled_over = "↻ " if task.get("rolledOver", False) else ""
            task_text = task.get("text", "")
            content += f"{status} {rolled_over}{task_text}\r\n"
        
        content += "\r\n----------------------------------------\r\n"
        content += "Exported from InkTodos\r\n"
        
        # Generate a filename with date
        date_for_filename = datetime.now().strftime("%Y-%m-%d")
        filename = f"InkTodos-{date_for_filename}.txt"
        
        # Return the file as a download
        return Response(
            content=content,
            media_type="text/plain",
            headers={
                "Content-Disposition": f"attachment; filename={filename}"
            }
        )
    except Exception as e:
        return Response(
            content=str(e),
            status_code=500
        )

# Run the server
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("server:app", host="0.0.0.0", port=port, reload=True)