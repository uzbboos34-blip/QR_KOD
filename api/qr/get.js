import { PrismaClient } from '../../src/generated/prisma/index.js';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id } = req.query;
    
    if (!id) {
      return res.status(400).json({ error: 'Missing ID parameter' });
    }

    const qrCode = await prisma.qr_codes.findUnique({
      where: { id }
    });

    if (!qrCode) {
      return res.status(404).json({ error: 'QR Code data not found' });
    }

    return res.status(200).json({ success: true, data: qrCode });
  } catch (error) {
    console.error("Error fetching QR record:", error);
    return res.status(500).json({ error: 'Failed to fetch QR code data' });
  }
}
