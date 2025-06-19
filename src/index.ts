// src/index.ts
import express from 'express'
import cors from 'cors'
import askAiRouter from './routes/ask-ai'

const app = express()
const PORT = process.env.PORT || 4000

app.use(cors())
app.use(express.json())

app.use('/api', askAiRouter)

app.get('/', (_req, res) => {
  res.send('LucidCode AI Server Running')
})

app.listen(PORT, () => {
  console.log(`AI server listening on http://localhost:${PORT}`)
})
