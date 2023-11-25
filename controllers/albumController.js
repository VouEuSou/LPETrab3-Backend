import { Log } from '../models/Log.js'
import { Album } from '../models/Album.js'
import { Usuario } from '../models/Usuario.js'

export const albumIndex = async (req, res) => {
  try {
    const albums = await Album.findAll({ include: { model: Usuario, attributes:['nome', 'email']}})
    res.status(200).json(albums)
  } catch (error) {
    res.status(400).send(error)
  }
}

export const albumIndexPicks = async (req, res) => {
  const staffpicks = 1
  try {
    const albums = await Album.findAll({ where: { staffpicks } })
    res.status(200).json(albums)
  } catch (error) {
    res.status(400).send(error)
  }
}

export const albumCreate = async (req, res) => {
  const { nome, artista, usuario_id, genero, preco, data, capa, staffpicks } = req.body
  console.log(req.body)
  if (!nome || !artista || !usuario_id || !genero || !preco || !data || !capa) {
    res.status(400).json({ id: 0, msg: "⚠️ Informe todos os dados" })
    return
  }
  try {
    const album = await Album.create({
      nome, artista, usuario_id, genero, preco, data, capa, staffpicks
    });
    res.status(201).json(album)
  } catch (error) {
    res.status(403).send(error)
  }
}

export const albumSearchByID = async (req, res) => {
  const { id } = req.params
  try {
    const album = await Album.findByPk(id)
    if (album == null) {
      res.status(400).json({ erro: "⚠️ Álbum não encontrado" })
      return
    }
    res.status(200).json(album)
  } catch (error) {
    res.status(400).send(error)
  }
}

export const albumDestroy = async (req, res) => {
  const { id } = req.params
  const user_logado_id = req.user_logado_id

  try {
    await Album.destroy({ where: { id } });
    await Log.create({
      descricao: "Exclusão do Álbum " + id,
      usuario_id: user_logado_id
    })

    res.status(200).json({ msg: "Ok! Removido com Sucesso" })
  } catch (error) {
    res.status(400).send(error)
  }
}

export const albumModify = async (req, res) => {
  const { id } = req.params
  const { nome, artista, usuario_id, genero, preco, data, capa, staffpicks } = req.body
  const user_logado_id = req.user_logado_id

  if (!nome || !artista || !usuario_id || !genero || !preco || !data || !capa) {
    res.status(400).json({ id: 0, msg: "⚠️ Informe todos os dados" })
    return
  }

  try {
    await Album.update({
      nome, artista, usuario_id, genero, preco, data, capa, staffpicks
    }, {
      where: { id }
    });
    await Log.create({
      descricao: "Alteração do Álbum " + id,
      usuario_id: user_logado_id
    })

    res.status(200).json({ msg: "Ok! Alterado com Sucesso" })
  } catch (error) {
    res.status(400).send(error)
  }
}