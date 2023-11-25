import express from 'express'
import cors from "cors"
import routes from './routes.js'

import { sequelize } from './databases/conecta.js'
import { Usuario } from './models/Usuario.js'
import { Album } from './models/Album.js'
import { Avaliacao } from './models/Avaliacao.js'
import { Log } from './models/Log.js'

const app = express()
const port = 3000

app.use(express.json())
app.use(cors())
app.use(routes)

async function conecta_db() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexão com banco de dados realizada com sucesso');

    await Usuario.sync({alter: false})
    await Album.sync({alter: false})
    await Avaliacao.sync({alter: false})
    await Log.sync({alter: false})

  } catch (error) {
    console.error('⚠️ Erro na conexão com o banco: ', error);
  }
}
conecta_db()

app.get('/', (req, res) => {
  res.send('API Loja de CDs Avenida')
})

app.listen(port, () => {
  console.log(`✅ Servidor Rodando na Porta: ${port}`)
})