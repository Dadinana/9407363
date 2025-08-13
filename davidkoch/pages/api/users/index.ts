import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { name, phone, email } = req.body;

    if (!name || !phone || !email) {
      return res.status(400).json({ error: 'Alle Felder sind erforderlich.' });
    }

    try {
      const newUser = await prisma.user.create({
        data: {
          name,
          phone,
          email,
        },
      });

      return res.status(201).json({ message: 'Nutzer gespeichert', user: newUser });
    } catch (error) {
      return res.status(500).json({ error: 'Fehler beim Speichern des Nutzers.' });
    }
  }

  if (req.method === 'GET') {
    const users = await prisma.user.findMany();
    return res.status(200).json(users);
  }

  return res.status(405).json({ error: 'Methode nicht erlaubt' });
}
