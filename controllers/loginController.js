import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import * as dotenv from 'dotenv'
dotenv.config()
import { Usuario } from "../models/Usuario.js";
import { Log } from "../models/Log.js";

export const loginUsuario = async (req, res) => {
  const { email, senha } = req.body
  if (!email || !senha) {
    res.status(400).json("⚠️ Login ou senha inválido")
    return
  }
  try {
    const usuario = await Usuario.findOne({ where: { email } })
    if (usuario == null) {
      res.status(400).json("⚠️ Login ou senha inválido")
      return
    }
    let usuario_id = usuario.id
    let usuario_nome = usuario.nome
    let usuario_email = usuario.email
    let usuario_isAdm = usuario.isAdm

    if (bcrypt.compareSync(senha, usuario.senha)) {
      const token = jwt.sign({
        user_logado_id: usuario.id,
        user_logado_nome: usuario.nome
      },
        process.env.JWT_KEY,
        { expiresIn: "1h" }
      )

      res.status(200).json({msg: "✅ Logado", token, usuario_id, usuario_nome, usuario_email, usuario_isAdm })
    } else {
      await Log.create({
        descricao: "Tentativa de Acesso com Senha Inválida",
        usuario_id: usuario.id
      })

      res.status(400).json("⚠️ Login ou senha inválido")
    }
  } catch (error) {
    res.status(400).json("⚠️ Login ou senha inválido")
    return
  }
}

