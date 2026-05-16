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
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Telegraph error response:', errorText)
      return NextResponse.json({ error: `Telegraph server xatosi: ${response.status}` }, { status: 500 })
    }

    const data = await response.json()
    console.log('Telegraph success response:', data)
    
    if (data.error || !Array.isArray(data) || data.length === 0) {
      return NextResponse.json({ error: data.error || "Noma'lum xato" }, { status: 400 })
    }

    // Telegraph returns an array of results
    const imageUrl = 'https://telegra.ph' + data[0].src
    return NextResponse.json({ url: imageUrl })
  } catch (err: any) {
    console.error('Upload error details:', err.message || err)
    return NextResponse.json({ error: `Server xatosi: ${err.message || "Noma'lum"}` }, { status: 500 })
  }
}
