import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const qrCodes = await prisma.qrCode.findMany({
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(qrCodes)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Server xatosi" }, { status: 500 })
  }
}
