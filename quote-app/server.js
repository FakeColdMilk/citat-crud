
import express from 'express'
import sqlite3 from 'sqlite3'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const db = new sqlite3.Database('./quotes.db')

app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(express.static('public'))


app.get('/', (req, res) => {
  db.all('SELECT * FROM quote', (err, rows) => {
    if (err) {
      console.error(err)
      return res.status(500).send('Database error')
    }
    res.render('index', { quotes: rows })
  })
})


app.get('/create', (req, res) => {
  res.render('create')
})


app.post('/api/quote', (req, res) => {
  const { text, author } = req.body
  const stmt = db.prepare('INSERT INTO quote (text, author) VALUES (?, ?)')
  stmt.run(text, author, function (err) {
    if (err) return res.status(500).send('Insert failed')
    res.redirect('/')
  })
  stmt.finalize()
})


app.get('/delete', (req, res) => {
  db.all('SELECT * FROM quote', (err, rows) => {
    if (err) return res.status(500).send('Database error')
    res.render('delete', { quotes: rows })
  })
})


app.delete('/api/quote/:id', (req, res) => {
  const id = req.params.id
  db.run('DELETE FROM quote WHERE id = ?', id, function (err) {
    if (err) return res.status(500).json({ success: false })
    res.json({ success: true })
  })
})


app.get('/update', (req, res) => {
  res.render('update')
})


app.put('/api/quote', (req, res) => {
  const { id, text, author } = req.body
  db.run(
    'UPDATE quote SET text = ?, author = ? WHERE id = ?',
    [text, author, id],
    function (err) {
      if (err) return res.status(500).json({ success: false })
      res.json({ success: true })
    }
  )
})

app.listen(3000, () => console.log('Server running at http://localhost:3000'))
