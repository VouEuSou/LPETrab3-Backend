import bcrypt from 'bcrypt'
import { Usuario } from '../models/Usuario.js'
import { Log } from "../models/Log.js";
import nodemailer from "nodemailer"

async function send_emailReset(nome, email) {
  let transport = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 587,
    auth: {
      user: "e46773b2b1c417",
      pass: "1e388d1aba4b1c"}});
  let msge = `<h1>Avenida Play</h1>`
  msge += `<p>Olá ${nome}, queríamos te avisar que sua senha foi redefinida com sucesso!</p>`
  msge += `<p>Caso não tenha sido você, contate o suporte imediatamente.</p>`
  let info = await transport.sendMail({
    from: '"Avenida Play" <AvenidaCDs@avenida.com>', 
    to: email, 
    subject: "Avenida Play: Confirmação de alteração de senha", 
    text: `Confirmação de alteração de senha`, 
    html: msge, 
  });}

  async function send_emailForgot(nome, email, hash) {
    let transport = nodemailer.createTransport({
      host: "sandbox.smtp.mailtrap.io",
      port: 587,
      auth: {
        user: "e46773b2b1c417",
        pass: "1e388d1aba4b1c"}});
    let msge = `<h1>Avenida Play</h1>`
    msge += `<p>Olá ${nome}, segue abaixo a hash necessária para recuperação de senha!</p>`
    msge += `<h1>${hash}</h1>`
    msge += `<p>Caso não tenha sido você, ignone este e-mail.</p>`
    let info = await transport.sendMail({
      from: '"Avenida Play" <AvenidaPlay@bento.com>', 
      to: email, 
      subject: "Avenida Play: Alteração de senha", 
      text: `Alteração de senha Avenida Play`, 
      html: msge, 
    });}


function validaSenha(senha) {
  const message = []
  if (senha.length < 10) {
    message.push("⚠️ Sua senha precisa de mínimo 10 caracteres")
  }
  let lowercase = 0
  let uppercase = 0
  let numbers = 0
  let symb = 0
  for (const letra of senha) {
    if ((/[a-z]/).test(letra)) {
      lowercase++
    }
    else if ((/[A-Z]/).test(letra)) {
      uppercase++
    }
    else if ((/[0-9]/).test(letra)) {
      numbers++
    } else {
      symb++
    }
  }
  if (lowercase == 0 || uppercase == 0 || numbers == 0 || symb == 0) {
    message.push("⚠️ Sua senha precisa de letras minúsculas, maiúsculas, números e símbolos")
  }
  return message
}

export const usuarioIndex = async (req, res) => {
  try {
    const usuarios = await Usuario.findAll({attributes: {exclude: ['saltmail', 'senha']}});
    res.status(200).json(usuarios)
  } catch (error) {
    res.status(400).send(error)
  }
}

export const usuarioCreate = async (req, res) => {
  const { nome, email, senha } = req.body
  const isAdm = 0
  console.log(req.body)
  if (!nome || !email || !senha) {
    res.status(400).json({ id: 0, msg: "⚠️ Informe nome, email e senha" })
    return
  }
  const emailpesq = await Usuario.findOne({ where: { email } })
  if (emailpesq != null) {
    res.status(410).json({ erro: "⚠️ E-mail já cadastrado" })
    return
  }

  const mensaValidacao = validaSenha(senha)
  if (mensaValidacao.length >= 1) {
    res.status(405).json({ id: 0, msg: mensaValidacao })
    return
  }  
  try {
    const usuario = await Usuario.create({
      nome, email, senha, isAdm
    });
    res.status(201).json("✅ Usuário cadastrado com sucesso")
  } catch (error) {
    res.status(400).send(error)
  }
}

export const usuarioAlteraSenha = async (req, res) => {
  const { email, senha, novaSenha } = req.body
  if (!email || !senha || !novaSenha) {
    res.status(400).json({ id: 0, msg: "⚠️ Informe email, senha e nova senha" })
    return
  }
  try {
    const usuario = await Usuario.findOne({ where: { email } })
    if (usuario == null) {
      res.status(400).json({ erro: "⚠️ E-mail inválido" })
      return
    }
    const mensaValidacao = validaSenha(novaSenha)
    if (mensaValidacao.length >= 1) {
      res.status(400).json({ id: 0, msg: mensaValidacao })
      return
    }  
    if (bcrypt.compareSync(senha, usuario.senha)) {
      const salt = bcrypt.genSaltSync(12)
      const hash = bcrypt.hashSync(novaSenha, salt)
      usuario.senha = hash
      usuario.saltmail = null
      await usuario.save()
      res.status(200).json({ msg: "✅ Senha Alterada com Sucesso" })
      send_emailReset(usuario.nome, email)
    } else {
      await Log.create({
        descricao: "Tentativa de Alteração de Senha",
        usuario_id: usuario.id
      })
      res.status(400).json({ erro: "⚠️ Senha inválida" })
    }
  } catch (error) {
    res.status(400).json(error)
  }
}


export const usuarioForgotPass = async (req, res) => {
  const { email, newpass, hash } = req.body
  console.log(req.body)
  try {
    const usuario = await Usuario.findOne({ where: { email } })
    if (usuario == null) {
      res.status(400).json({ erro: "⚠️ E-mail inválido" })
      return
    }
    if (hash == null) {
      var chars = "0123456789";
      var verification = "";
    for (var i = 0; i <= 6; i++) {
      var randomNumber = Math.floor(Math.random() * chars.length);
      verification += chars.substring(randomNumber, randomNumber +1);}
      console.log(verification)
      usuario.saltmail = verification
      await usuario.save()
      send_emailForgot(usuario.nome, email, verification)
      res.status(410).json({ id: 0, msg: "✅ Hash enviada ao e-mail cadastrado!" })
      return
      }
    if (!email || !newpass) {
        res.status(400).json({ id: 0, msg: "⚠️ Informe a nova senha" })
        return
      }
    if (usuario.saltmail != hash) {
      return res.status(401).send({ Erro: "⚠️ Hash incorreta" })
    }
    const mensaValidacao = validaSenha(newpass)
    if (mensaValidacao.length >= 1) {
      res.status(400).json({ id: 0, msg: mensaValidacao })
      return
    }  
    try {
      const salt = bcrypt.genSaltSync(12)
      const hash = bcrypt.hashSync(newpass, salt)
      usuario.senha = hash
      usuario.saltmail = null
      await usuario.save()
      res.status(200).json({ msg: "✅ Senha Alterada com Sucesso" })
      send_emailReset(usuario.nome, email)
    } catch (error) {    
      res.status(400).json(error)
    }
  } catch (error) {
    res.status(400).json(error)
  }
}

