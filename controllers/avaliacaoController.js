import { sequelize } from '../databases/conecta.js'
import { Avaliacao } from '../models/Avaliacao.js';
import { Album } from '../models/Album.js';
import nodemailer from "nodemailer" 

async function send_email(nome, email) {
  let transport = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 587,
    auth: {
      user: "e46773b2b1c417",
      pass: "1e388d1aba4b1c"}});
  let msge = `<h1>Loja de CDs Avenida</h1>`
  msge += `<p>Olá ${nome}, este email confirma sua avaliação em nossa loja!</p>`
  let info = await transport.sendMail({
    from: '"Loja de CDs Avenida" <AvenidaCDs@avenida.com>', 
    to: email, 
    subject: "Avenida CDs: Confirmação de avaliação", 
    text: `Confirmação de avaliação da loja AvenidaCDs`, 
    html: msge, 
  });}

export const avaliacaoIndex = async (req, res) => {
  try {
    const avaliacoes = await Avaliacao.findAll({
      include: Album
    });
    res.status(200).json(avaliacoes)
  } catch (error) {
    res.status(400).send(error)
  }
}

export const avaliacaoCreate = async (req, res) => {
  const { album_id, email, nome, comentario, nota } = req.body
  if (!album_id || !nome || !email || !comentario || !nota) {
    res.status(400).json({ id: 0, msg: "Erro... Informe os dados" })
    return
  }
  if (nota>5){
    res.status(400).json({ id: 0, msg: "⚠️ Informe nota de 1 a 5" })
    return
  }
  if (nota<0){
    res.status(400).json({ id: 0, msg: "⚠️ Informe nota de 1 a 5" })
  }
  const avalpesq = await Avaliacao.findOne({ where: { album_id: album_id, email: email } })
  if (avalpesq != null) {
    const tr = await sequelize.transaction();
      const id = avalpesq.id
      const avaliacao = await Avaliacao.findByPk(avalpesq.id)
      await Album.decrement('total_notas',
        { by: avaliacao.nota, 
          where: { id: avaliacao.album_id }, 
          transaction: tr }
      );
      await Album.decrement('qtde_notas',
        { by: 1, 
          where: { id: avaliacao.album_id }, 
          transaction: tr }
      );
      await Avaliacao.destroy({
          where: { id }
      });
      await tr.commit();
  }

  const t = await sequelize.transaction();
  try {

    const avaliacao = await Avaliacao.create({
      album_id, email, nome, comentario, nota
    }, { transaction: t });

    await Album.increment('total_notas',
      { by: nota, where: { id: album_id }, transaction: t }
    );

    await Album.increment('qtde_notas',
      { by: 1, where: { id: album_id }, transaction: t }
    );

    await t.commit();
    res.status(201).json(avaliacao)

  } catch (error) {

    await t.rollback();
    res.status(400).json({"id": 0, "Erro": error})

  }
  const album = await Album.findOne({ where: { id : album_id } })
  await album.save()
  send_email(nome, email)
}

export const avaliacaoDestroy = async (req, res) => {
  const { id } = req.params
  const t = await sequelize.transaction();
  try {
    const avaliacao = await Avaliacao.findByPk(id)
    await Album.decrement('total_notas',
      { by: avaliacao.nota, 
        where: { id: avaliacao.album_id }, 
        transaction: t }
    );
    await Album.decrement('qtde_notas',
      { by: 1, 
        where: { id: avaliacao.album_id }, 
        transaction: t }
    );
    await Avaliacao.destroy({
        where: { id }
    });
    await t.commit();
    res.status(200).json({msg: "Ok! Avaliação Excluída com Sucesso"})
  } catch (error) {
    await t.rollback();
    res.status(400).json({"id": 0, "Erro": error})

  }
}
