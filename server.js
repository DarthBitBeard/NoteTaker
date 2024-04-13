const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// Serve static files from 'assets' directory
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// Serve the landing page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Serve the notes page
app.get('/notes', (req, res) => {
  res.sendFile(path.join(__dirname, 'notes.html'));
});

// Endpoint to get all notes
app.get('/api/notes', (req, res) => {
  fs.readFile(path.join(__dirname, 'db/db.json'), 'utf8', (err, data) => {
    if (err) {
      return res.status(500).json({ error: 'Error reading notes data.' });
    }
    res.json(JSON.parse(data));
  });
});

// Endpoint to add a new note
app.post('/api/notes', (req, res) => {
  const newNote = req.body;
  fs.readFile(path.join(__dirname, 'db/db.json'), 'utf8', (err, data) => {
    if (err) {
      return res.status(500).json({ error: 'Error reading notes data.' });
    }
    const notes = JSON.parse(data);
    notes.push(newNote);
    fs.writeFile(path.join(__dirname, 'db/db.json'), JSON.stringify(notes), (err) => {
      if (err) {
        return res.status(500).json({ error: 'Error writing new note.' });
      }
      res.json(newNote);
    });
  });
});

// Endpoint to delete a note
app.delete('/api/notes/:id', (req, res) => {
  const noteId = req.params.id;
  fs.readFile(path.join(__dirname, 'db/db.json'), 'utf8', (err, data) => {
    if (err) {
      return res.status(500).json({ error: 'Error reading notes data.' });
    }
    let notes = JSON.parse(data);
    notes = notes.filter(note => note.id !== noteId);
    fs.writeFile(path.join(__dirname, 'db/db.json'), JSON.stringify(notes), (err) => {
      if (err) {
        return res.status(500).json({ error: 'Error deleting note.' });
      }
      res.json({ message: 'Note deleted.' });
    });
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
