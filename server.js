import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 7000;
const JWT_SECRET = process.env.JWT_SECRET || 'Hsijq5wi3urm1xz4opaspmd'; // Use variáveis de ambiente para segurança

app.use(cors());
app.use(express.json());

// Middleware para validação de token JWT
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Formato Bearer

  if (!token) {
    return res.status(401).json({ error: 'Nenhum token fornecido' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Falha ao autenticar o token' });
    }
    req.userId = decoded.id;
    next();
  });
}

// Rota de cadastro (não precisa de autenticação)
app.post('/user/register', async (req, res) => {
  const { name, username, age, email, gender, password, knowledgeLevel, reasonsWhy } = req.body;

  console.log('Dados recebidos:', req.body); // Log dos dados recebidos

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.users.create({
      data: {
        name,
        username,
        age,
        email,
        gender,
        knowledgeLevel,
        reasonsWhy,
        password: hashedPassword,
      },
    });
    res.status(201).json({ message: 'User criado' });
  } catch (error) {
    console.error('Erro ao criar usuário:', error); // Log do erro
    res.status(500).json({ error: 'Erro ao criar usuário' });
  }
});

// Rota de login (não precisa de autenticação)
app.post('/user/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email e senha são obrigatórios' });
  }

  try {
    const user = await prisma.users.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado!' });
    }

    const verifyPassword = await bcrypt.compare(password, user.password);
    if (!verifyPassword) {
      return res.status(401).json({ error: 'Senha inválida!' });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });

    res.status(200).json({ message: 'Logado', token });
  } catch (error) {
    console.error('Erro ao fazer login:', error); // Log do erro
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Outras rotas protegidas (precisam de autenticação)
app.get('/protected', authenticateToken, (req, res) => {
  res.json({ message: 'This is a protected route' });
});

// Iniciar o servidor
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
