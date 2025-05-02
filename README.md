# InkTodos

A minimalist daily task planner optimized for e-reader web browsers like Kindle and Kobo.

## Features

- Lightweight and fast, designed for e-ink displays
- Simple interface with high contrast for easy reading
- Daily tasks that reset each day
- Local storage only (no server required, except for serving)
- Add, complete, and delete tasks
- Automatically archives old tasks

## Running the Server

### Installation

1. Make sure you have Python 3.7+ installed
2. Install the requirements:

```bash
pip install -r requirements.txt
```

### Starting the Server

Run the FastAPI server with:

```bash
python server.py
```

The server will start on port 8000 by default. You can change this by setting the PORT environment variable.

### Accessing the App

- On your local network: http://YOUR_COMPUTER_IP:8000
- On your e-reader: Open the browser and navigate to http://YOUR_COMPUTER_IP:8000

## Usage

1. Load the app in your e-reader's web browser
2. Add tasks using the input field at the top
3. Tap on a task or its checkbox to mark it as complete
4. Use the × button to delete a task

## Design Considerations

- Minimal JavaScript for better performance on e-readers
- High contrast UI with simple interactions
- No external dependencies
- Optimized for e-ink displays with reduced animations

## Deploying to the Internet

You can deploy this app to services like:

- Heroku
- Render
- Railway
- Fly.io

Simply follow their Python/FastAPI deployment guides and point to the server.py file.

## Local Storage

Tasks are stored locally in your browser using the following format:
- Each day's tasks are stored with a unique key (tasks-MM/DD/YYYY)
- Tasks older than 30 days are automatically removed to save space

To clear all data, you can use your browser's option to clear site data.