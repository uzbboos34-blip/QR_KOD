import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import QRCode from 'qrcode'

export async function POST(req: NextRequest) {
  try {
    const { type, content, label } = await req.json()

    if (!type || !content) {
      return NextResponse.json({ error: "type va content majburiy" }, { status: 400 })
    }

    // Generate QR code as base64 PNG
    const qrDataUrl = await QRCode.toDataURL(content, {
      width: 400,
      margin: 2,
      color: { dark: '#1a0533', light: '#ffffff' },
      errorCorrectionLevel: 'M',
    })

    // Save to database
    const qr = await prisma.qrCode.create({
      data: {
        type,
        content,
        qrDataUrl,
        label: label || null,
      },
    })

    return NextResponse.json(qr, { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Server xatosi" }, { status: 500 })
  }
}
