import mysql from 'mysql2'

const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "olehDB"
}).promise()

export async function getNotes() {
    const [rows] = await connection.query("SELECT * FROM notes")
    return rows
}

export async function getNote(id) {
    const [rows] = await connection.query(`SELECT * FROM notes WHERE id = ${id} `)
    return rows
}

// const notes = await getNote(3)
// console.log(notes)

export async function createNote(title, contents) {
    const [result] = await connection.query(`INSERT INTO notes (title, contents) VALUES (?, ?)`,[title,contents])
    const id =result.insertId
    return getNote(id)
}

// const result = await createNote('newNote333', 'newwwwwTextworks')
// console.log(result)

export async function deleteNoteById(id) {
    const [result] = await connection.query(`DELETE FROM notes WHERE id = ?`, [id])
    return result.affectedRows > 0;
}

export async function deleteAllNotes() {
    const [result] = await connection.query(`DELETE FROM notes`)
    await connection.query('ALTER TABLE notes AUTO_INCREMENT = 1')
    return result
}





