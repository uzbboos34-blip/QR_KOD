import { PrismaClient } from '../../src/generated/prisma/index.js';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id, type, content, qrDataUrl, label } = req.body;
    
    if (!id || !type || !content) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const qrCode = await prisma.qr_codes.create({
      data: {
        id,
        type,
        content,
        qrDataUrl: qrDataUrl || '',
        label: label || ''
      }
    });

    return res.status(200).json({ success: true, data: qrCode });
  } catch (error) {
    console.error("Error creating QR record:", error);
    return res.status(500).json({ error: 'Failed to save QR code data' });
  }
}
