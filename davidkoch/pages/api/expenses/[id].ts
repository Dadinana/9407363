import { prisma } from "../../../lib/prisma";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const id = req.query.id as string;

  if (req.method === "PUT") {
    const { amount, description } = req.body;

    try {
      const updated = await prisma.expense.update({
        where: { id },
        data: {
          amount: parseFloat(amount),
          description,
        },
      });
      return res.status(200).json(updated);
    } catch (error) {
      return res.status(500).json({ error: "Fehler beim Aktualisieren der Ausgabe." });
    }
  }

  if (req.method === "DELETE") {
    try {
      await prisma.expense.delete({ where: { id } });
      return res.status(200).json({ message: "Ausgabe gelöscht." });
    } catch (error) {
      return res.status(500).json({ error: "Fehler beim Löschen der Ausgabe." });
    }
  }

  return res.status(405).json({ error: "Methode nicht erlaubt" });
}
