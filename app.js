import express from 'express'
const app = express();

import 'dotenv/config'
const port = process.env.PORT || 8080

app.use(express.static('public'));


app.use(express.json())
// Middleware to parse form data (urlencoded)
app.use(express.urlencoded({ extended: true }));

app.set('view engine', 'ejs');

import { getNote, getNotes, createNote, deleteNoteById, deleteAllNotes} from './database.js';



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

// Show all 
app.get('/notes', async(req, res) => {
  const notes = await getNotes()
  if (notes.length != 0) {
  res.send(notes) 
  }else{
  res.send("no notes yet") 
  }
});

// Show by ID
app.get('/notes/:id', async(req, res) => {
  const id = req.params.id
  const note = await getNote(id)
  if(note && note.length > 0){
    res.send(note) 
  }else{
    res.send(`note ${id} doesnt exist`) 
  }
  
});

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


app.listen(port, ()=>{
    console.log(`PORT: ${port}`)
})
