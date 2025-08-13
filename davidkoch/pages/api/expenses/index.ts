import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { amount, description, date, userId } = req.body;

    if (!amount || !description || !date || !userId) {
      return res.status(400).json({ error: 'Alle Felder sind erforderlich.' });
    }

    try {
      const expense = await prisma.expense.create({
        data: {
          amount: parseFloat(amount),
          description,
          date: new Date(date),
          userId,
        },
      });

      return res.status(201).json({ message: 'Ausgabe gespeichert', expense });
    } catch (error) {
      return res.status(500).json({ error: 'Fehler beim Speichern der Ausgabe.' });
    }
  }

  if (req.method === 'GET') {
    const expenses = await prisma.expense.findMany({
      include: {
        user: true,
      },
      orderBy: {
        date: 'desc',
      },
    });

    return res.status(200).json(expenses);
  }

  return res.status(405).json({ error: 'Methode nicht erlaubt' });
}
