import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'Fayl topilmadi' }, { status: 400 })
    }

    // Proxy request to Telegraph
    const telegraphFormData = new FormData()
    telegraphFormData.append('file', file)

    const response = await fetch('https://telegra.ph/upload', {
      method: 'POST',
      body: telegraphFormData,
    })

    if (!response.ok) {
      return NextResponse.json({ error: 'Telegraph serveriga yuklashda xato' }, { status: 500 })
    }

    const data = await response.json()
    
    if (data.error) {
      return NextResponse.json({ error: data.error }, { status: 400 })
    }

    // Telegraph returns an array of results
    const imageUrl = 'https://telegra.ph' + data[0].src
    return NextResponse.json({ url: imageUrl })
  } catch (err) {
    console.error('Upload error:', err)
    return NextResponse.json({ error: 'Server xatosi' }, { status: 500 })
  }
}
