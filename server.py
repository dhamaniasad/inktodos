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
async def export_tasks(request: Request):
    """
    Generate a text file from the tasks data and send it as a downloadable file.
    Supports both JSON and form submissions.
    """
    try:
        # Try to get the data from different sources
        data = None
        
        # Check content type
        content_type = request.headers.get('content-type', '')
        
        if 'application/json' in content_type:
            # Handle JSON request
            raw_data = await request.json()
            data = raw_data
        elif 'application/x-www-form-urlencoded' in content_type or 'multipart/form-data' in content_type:
            # Handle form submission
            form_data = await request.form()
            if 'data' in form_data:
                data = json.loads(form_data['data'])
        else:
            # Try to parse body as JSON anyway
            try:
                raw_body = await request.body()
                if raw_body:
                    body_str = raw_body.decode()
                    if body_str:
                        data = json.loads(body_str)
            except:
                pass
        
        # If we couldn't get data from any source, return error
        if not data:
            return Response(
                content="No data received or format not supported",
                status_code=400
            )
        
        # Extract task data
        tasks = data.get("tasks", [])
        date_string = data.get("date", datetime.now().strftime("%A, %B %d, %Y"))
        
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