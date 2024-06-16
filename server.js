import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 3000;


app.use(cors());
app.use(express.json());

// Rota de cadastro
app.post('/user/register', async (req, res) => {
    const { name, username, age, email, gender, password, knowledgeLevel, reasonsWhy } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        const users = await prisma.users.create({
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
        res.status(201).json({ message: 'User created' }); /**OBSERVACAO: MELHORAR OS TRATAMENTOS DE ERROS */
    } catch (error) {
        if (error.code === 'P2002') {
            res.status(400).json({ error: 'Email already exists' });
        } else {
            res.status(500).json({ error: 'Internal server error' });
        }
    }
});

// Rota Cadastro

app.post('/user/login', async (req, res) => {

    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    try {
        const user = await prisma.users.findUnique({
            where: {
                email: email,
            }
        })
        if (user == null) {
            return res.json({ message: "Usuario nao existe" })
        }

        const verifyPassword = bcrypt.compareSync(password, user.password);
        if (verifyPassword) {
            res.json(user)
        } else {
            res.json({ message: "Senha Incorreta" })
        }

    }
    catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Internal server error' });
    }
})

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
