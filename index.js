// RETORNO DE TOKEN JWT NA ROTA 'USER/LOGIN'
const http = require('http')
const express = require('express') 
const app = express()
const bodyParser = require('body-parser')
const jwt = require('jsonwebtoken')
const SECRET = Hsijq5wi3urm1xz4opaspmd

app.use(bodyParser.json())
 
app.get('/', (req, res, next) => {
    res.json({msg: "Tudo ok por aqui!"})
})
 
function verifyJWT(req, res, next){
    const token = req.headers['authorization']
    const index = blackList.findIndex(item => item == token) //caso haja blacklist
    if(index !== -1) res.status(401).end //caso haja blacklist
    
    if (!token) return res.status(401).json({ auth: false, msg: 'Nenhum token fornecido.' })
    
    jwt.verify(token, process.env.SECRET, function(err, decoded) {
      if (err) return res.status(500).json({ auth: false, msg: 'Falha ao autenticar o token.' })
      
      // se tudo estiver ok, salva no request para uso posterior
      req.userId = decoded.id
      next()
    })
}

app.get('/clientes', (req, res, next) => { 
    console.log(req.userId + 'fez esta chamada!')
    console.log("Retornou todos clientes!")
    res.json([{id:1, nome:'viviane'}])
}) 

app.post('/login', (req, res, next) => {
    //esse teste abaixo deve ser feito no banco de dados
    if(req.body.user === 'viviane' && req.body.password === '123'){
      //auth ok
      const id = 1 //esse id virá do banco de dados
      const token = jwt.sign({ id }, process.env.SECRET, {
        expiresIn: 300 // expiresIn 5min (300s)
      })
      return res.json({ auth: true, token: token })
    }
    
    res.status(500).json({msg: 'Login inválido!'})
})

//blackList de tokens, caso houver (mongo)
const blackList = []

app.post('/logout', function(req, res) {
    blackList.push(req.headers ['authorization'])
    res.json({ auth: false, token: null })
})

const server = http.createServer(app)
server.listen(3000)
app.listen(3000, () => console.log("Server conectado a porta 3000"))
