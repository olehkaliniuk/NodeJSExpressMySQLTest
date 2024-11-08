import express from 'express'
const app = express();




//file upload
import fileUpload from 'express-fileupload';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/upload', express.static(path.join(__dirname, 'upload')));

import 'dotenv/config'
const port = process.env.PORT || 8080

app.use(express.static('public'));
app.use(fileUpload())


app.use(express.json())
// Middleware to parse form data (urlencoded)
app.use(express.urlencoded({ extended: true }));

app.set('view engine', 'ejs');

import { getNote, getNotes, createNote, deleteNoteById, deleteAllNotes, addDescription, addImagePathToNoteById} from './database.js';



//show notes with html
app.get('/', async(req, res) => {

  const { id } = req.query;
  let selectedNote = null;
  let notes = [];

  if (id) {
    
    const note = await getNote(id);
    if (note && note.length > 0) {
      selectedNote = note[0]; 
    }
  } else {
    
    notes = await getNotes();
  }

  res.render('notes', { selectedNote, notes });

});

// Show all // Not relevant
app.get('/notes', async(req, res) => {
  const notes = await getNotes()
  if (notes.length != 0) {
  res.send(notes) 
  }else{
  res.send("no notes yet") 
  }
});

// Show by ID and form desc and img
app.get('/notes/:id', async (req, res) => {
  const id = req.params.id;
  const note = await getNote(id); 

  let showForm = false;
  let showImgForm = false;

  if (note && note.length > 0) {
      const selectedNote = note[0];
      
      if (!selectedNote.descriptions) {
          showForm = true; 
      }
      if (!selectedNote.image_path) {
        showImgForm = true; 
    }

      res.render('notesByID', { showForm, showImgForm, selectedNote, imagePath: selectedNote.image_path});
      console.log(showForm)
}});

// Create new
app.post('/notes/create', async (req, res) => {
  const { title, contents } = req.body;
  const newNote = await createNote(title, contents)    
  res.redirect(`/`)
  
});

// Delete by ID
app.post('/notes/delete/:id', async (req, res) => {
  const id = req.params.id;
  const success = await deleteNoteById(id);

  if (success) {
    res.redirect('/')
  }else{
    res.send(`note ${id} doesnt exist`) 
  }
});

// Delete all notes
app.post('/notes/delete', async (req, res) => {
  const count = await deleteAllNotes();
  if (count > 0) {
    res.redirect('/')
  }else{
    res.redirect('/')
  // res.send("no notes yet")
  }
});

// Add description to an existing note
app.post('/notes/:id/descriptions', async (req, res) => {
  const id = req.params.id;
  const { descriptions } = req.body;

  // console.log('Descriptions:', descriptions);
  // console.log('ID:', id);

  const updatedNote = await addDescription(descriptions, id);
  if (updatedNote && updatedNote.length > 0) {
    res.redirect('/');
  } else {
    res.redirect('/');
  }
});




//Post photo
app.post('/notes/:id/img', async (req, res) => {
  let sampleFile;
  let uploadPath;

  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).json({ message: 'No files were uploaded.' });
  }

  sampleFile = req.files.sampleFile;

  const relativePath = '/upload/' + sampleFile.name;
  uploadPath = path.join(__dirname, relativePath);


  if (!fs.existsSync(path.join(__dirname, 'upload'))) {
    fs.mkdirSync(path.join(__dirname, 'upload'));
  }


  sampleFile.mv(uploadPath, async function (err) {
    if (err) {
      console.error(err);
      return res.status(500);
    }

    const id = req.params.id;
    const success = await addImagePathToNoteById(id, relativePath);

    if (success) {
      
      res.redirect('/');
    }
     else {
      res.status(500);
    }
  });
});






//run server
app.listen(port, ()=>{
    console.log(`PORT: ${port}`)
})
