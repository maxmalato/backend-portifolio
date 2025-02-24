import express, { Request, Response } from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';

type Feedback = {
    id: number;
    name: string;
    comment: string;
    createdAt: Date;
    updatedAt: Date;
}

const app = express();
const prisma = new PrismaClient();
app.use(cors());
app.use(express.json());

// Rota para listar todos os feedbacks
app.get('/feedbacks', async (req: Request, res: Response) => {
    const feedbacks = await prisma.feedback.findMany({
        orderBy: {
            createdAt: 'desc'
        }
    });
    res.json(feedbacks);
});

// Rota para criar um feedback
app.post('/feedbacks', async (req: Request<{}, {}, { name: string; comment: string }>, res: Response) => {
    const { name, comment } = req.body;

    if (!name || !comment) {
        return res.status(400).json({
            error: 'Nome e comentário são obrigatórios.'
        });
    }

    const newFeedback = await prisma.feedback.create({
        data: {
            name,
            comment
        }
    });
    res.status(201).json(newFeedback);
});

// Rota para atualizar um feedback
app.put('/feedbacks/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name, comment } = req.body;

    // Encontra o feedback existente pelo ID
    const existingFeedback = await prisma.feedback.findUnique({
        where: {
            id: Number(id)
        }
    });

    // Verifica se o feedback existe
    if (!existingFeedback) {
        return res.status(404).json({
            error: 'Feedback não encontrado.'
        });
    }

    // Verifica se o nome do feedback é o mesmo do usuário que está tentando editar
    if (existingFeedback.name !== name) {
        return res.status(403).json({
            error: 'Você só pode editar os seus próprios comentários.'
        })
    }

    const updateFeedback = await prisma.feedback.update({
        where: {
            id: Number(id)
        },
        data: {
            comment
        }
    });
    res.json(updateFeedback);
});

// Rota para deletar um feedback
app.delete('/feedbacks/:id', async (req, res) => {
    const { id } = req.params;

    // Encontra o feedback existente pelo ID
    const existingFeedback = await prisma.feedback.findUnique({
        where: {
            id: Number(id)
        }
    });

    // Verifica se o feedback existe
    if (!existingFeedback) {
        return res.status(404).json({
            error: 'Comentário não encontrado.'
        });
    }

    await prisma.feedback.delete({
        where: {
            id: Number(id)
        }
    });
    res.json({
        message: 'Comentário deletado com sucesso.'
    });
});

// Inicia o servidor na porta 5000
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});