import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || ''
    if (!contentType.includes('multipart/form-data')) {
      return NextResponse.json({ error: 'Faqat multipart/form-data qabul qilinadi' }, { status: 400 })
    }

    // We use a transparent proxy approach: we read the exact raw body sent by the browser
    // and forward it to Telegraph. This preserves the boundaries and filename perfectly.
    const bodyBuffer = await req.arrayBuffer()

    console.log(`Forwarding raw body to Telegraph, size: ${bodyBuffer.byteLength} bytes`)

    const response = await fetch('https://telegra.ph/upload', {
      method: 'POST',
      body: bodyBuffer,
      headers: {
        'Content-Type': contentType,
        'Content-Length': bodyBuffer.byteLength.toString(),
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Telegraph error status:', response.status)
      console.error('Telegraph error body:', errorText)
      return NextResponse.json({ 
        error: `Telegraph server xatosi: ${response.status}`,
        details: errorText.slice(0, 100)
      }, { status: 400 }) // Return 400 so we know it's an upstream error, not our crash
    }

    const data = await response.json()
    console.log('Telegraph response:', JSON.stringify(data))
    
    if (!Array.isArray(data) || data.length === 0) {
      return NextResponse.json({ 
        error: 'Telegraph noto\'g\'ri formatda javob qaytardi',
        data: data
      }, { status: 400 })
    }

    if (data[0].error) {
      return NextResponse.json({ error: data[0].error }, { status: 400 })
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
