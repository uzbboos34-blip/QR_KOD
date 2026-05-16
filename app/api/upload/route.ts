import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'
import FormData from 'form-data'

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || ''
    if (!contentType.includes('multipart/form-data')) {
      return NextResponse.json({ error: 'Faqat multipart/form-data qabul qilinadi' }, { status: 400 })
    }

    // Parse the incoming form data
    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: "Fayl topilmadi. 'file' field yuborish kerak" }, { status: 400 })
    }

    console.log(`Uploading file to Telegraph: ${file.name}, size: ${file.size} bytes, type: ${file.type}`)

    // Rebuild a fresh FormData to send to Telegraph using 'form-data' package
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    
    const telegraphForm = new FormData()
    telegraphForm.append('file', buffer, {
      filename: file.name || 'image.jpg',
      contentType: file.type || 'image/jpeg',
    })

    const response = await axios.post('https://telegra.ph/upload', telegraphForm, {
      headers: {
        ...telegraphForm.getHeaders(),
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json',
      },
      validateStatus: () => true // Barcha statuslarni o'zimiz ushlaymiz
    })

    console.log('Telegraph status:', response.status)
    console.log('Telegraph response:', response.data)

    if (response.status >= 400) {
      return NextResponse.json({
        error: `Telegraph server xatosi: ${response.status}`,
        details: typeof response.data === 'string' ? response.data.slice(0, 200) : JSON.stringify(response.data)
      }, { status: 400 })
    }

    const data = response.data;

    if (!Array.isArray(data) || data.length === 0) {
      return NextResponse.json({
        error: "Telegraph bo'sh javob qaytardi",
        data: data
      }, { status: 400 })
    }

    if (data[0].error) {
      return NextResponse.json({ error: data[0].error }, { status: 400 })
    }

    if (!data[0].src) {
      return NextResponse.json({
        error: "Telegraph javobida 'src' yo'q",
        data: data[0]
      }, { status: 400 })
    }

    const imageUrl = 'https://telegra.ph' + data[0].src
    return NextResponse.json({ url: imageUrl })

  } catch (err: any) {
    console.error('API Upload Critical Error:', err)
    return NextResponse.json({
      error: 'Server xatosi',
      message: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    }, { status: 500 })
  }
}