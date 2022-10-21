const express = require('express');
const path = require('path');
let noteData = require('./db/db.json');
const uuid = require('./helper/uuid');
const fs = require('fs');

const PORT = process.env.PORT || 3001;

const app = express();

// Sets up the Express app to handle data parsing
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static('public'));


app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '/public/index.html'));
});

app.get('/notes', (req, res) => {
  res.sendFile(path.join(__dirname, '/public/notes.html'));
});

app.get('/api/notes', (req, res) => res.json(noteData));

app.get('/api/notes/:note_id', (req, res) => {
  console.log(req.params)
  const id = req.params.note_id;
  const selectedNote = noteData.find(note => note.note_id === id)
  if (selectedNote) {
    res.json(selectedNote)
  } else {
    res.status(404).json({message: "Note does not exist"})
  }
});


app.post('/api/notes', (req, res) => {
  // Log that a POST request was received
  console.info(`${req.method} request received to add a new note`);

  // Destructuring assignment for the items in req.body
  const { title, text } = req.body;

  // If all the required properties are present
  if (title && text) {
    // Variable for the object we will save
    const newNote = {
      title,
      text,
      note_id: uuid(),
    };

    // Obtain existing notes
    fs.readFile('./db/db.json', 'utf8', (err, data) => {
      if (err) {
        console.error(err);
      } else {
        // Convert string into JSON object
        const parsedNotes = JSON.parse(data);

        // Add a new note
        const notes = parsedNotes.push(newNote);

        // Write updated notes back to the file---------check out writefile async
        fs.writeFile(
          './db/db.json',
          JSON.stringify(notes),
          (writeErr) =>
            writeErr
              ? console.error(writeErr)
              : console.info('Successfully updated Notes!')
        );
      }
    });

    const response = {
      status: 'success',
      body: newNote,
    };

    console.log(response);
    res.status(201).json(response);
  } else {
    res.status(500).json('Error in posting note');
  }
});

app.delete('/api/notes/:note_id', (req, res) => {
  const id = req.params.note_id;
  const deleted = noteData.find(note => note.note_id === id)
  if (!deleted) {
    res.status(404).json({message: "Note does not exist."})
  } else {
    noteData = noteData.filter(note => note.note_id != id)
    fs.writeFile(
      './db/db.json',
      JSON.stringify(noteData, null, 4),
      (writeErr) =>
            writeErr
              ? console.error(writeErr)
              : console.info('Successfully deleted Note!')
      );
    res.json(deleted);
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening at http://localhost:${PORT}`);
});