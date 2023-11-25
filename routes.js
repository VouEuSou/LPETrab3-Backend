import { Router } from "express"
import { usuarioAlteraSenha, usuarioForgotPass, usuarioCreate, usuarioIndex } from "./controllers/usuarioController.js"
import { avaliacaoCreate, avaliacaoDestroy, avaliacaoIndex } from "./controllers/avaliacaoController.js"
import { albumCreate, albumDestroy, albumIndex, albumIndexPicks, albumSearchByID, albumModify } from "./controllers/albumController.js"
import { loginUsuario } from "./controllers/loginController.js"
import { verificaLogin } from "./middlewares/verificaLogin.js"

const router = Router()

router.get('/usuarios', usuarioIndex)
      .post('/usuarios', usuarioCreate)
      .put('/usuarios', usuarioAlteraSenha)
      .put('/usuarios/recup', usuarioForgotPass)

router.get('/avaliacoes', avaliacaoIndex)
      .post('/avaliacoes', verificaLogin, avaliacaoCreate)
      .delete('/avaliacoes/:id', verificaLogin, avaliacaoDestroy)

router.get('/album', albumIndex)
      .get('/album/picks', albumIndexPicks)
      .post('/album', verificaLogin, albumCreate)
      .put('/album/edit/:id', verificaLogin , albumModify)
      .get('/album/:id', albumSearchByID)
      .delete('/album/:id', verificaLogin, albumDestroy)

router.post('/login', loginUsuario)

export default router