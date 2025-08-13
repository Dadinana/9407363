import { prisma } from "../../../lib/prisma";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const id = req.query.id as string;

  if (req.method === "PUT") {
    const { name, phone, email } = req.body;

    try {
      const updated = await prisma.user.update({
        where: { id },
        data: { name, phone, email },
      });
      return res.status(200).json(updated);
    } catch (error) {
      return res.status(500).json({ error: "Fehler beim Aktualisieren des Nutzers." });
    }
  }

  if (req.method === "DELETE") {
    try {
      await prisma.user.delete({ where: { id } });
      return res.status(200).json({ message: "Nutzer gelöscht." });
    } catch (error) {
      return res.status(500).json({ error: "Fehler beim Löschen des Nutzers." });
    }
  }

  return res.status(405).json({ error: "Methode nicht erlaubt" });
}
