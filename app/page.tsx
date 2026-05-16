'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import styles from './page.module.css'

interface QrResult {
  id: string
  type: string
  content: string
  qrDataUrl: string
  label: string | null
  createdAt: string
}

export default function Home() {
  const [tab, setTab] = useState<'text' | 'image'>('text')
  const [text, setText] = useState('')
  const [label, setLabel] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<QrResult | null>(null)
  const [dragover, setDragover] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFile = (f: File) => {
    setFile(f)
    const reader = new FileReader()
    reader.onload = (e) => setPreview(e.target?.result as string)
    reader.readAsDataURL(f)
    setError('')
  }

  const uploadToTelegraph = async (f: File): Promise<string> => {
    const fd = new FormData()
    fd.append('file', f)
    const res = await fetch('/api/upload', { method: 'POST', body: fd })
    if (!res.ok) {
      const errorData = await res.json()
      throw new Error(errorData.error || 'Rasm yuklanmadi')
    }
    const data = await res.json()
    return data.url
  }

  const generate = async () => {
    setError('')
    setResult(null)

    let content = ''
    const type = tab

    if (tab === 'text') {
      content = text.trim()
      if (!content) { setError('Matn kiriting!'); return }
    } else {
      if (!file) { setError('Rasm tanlang!'); return }
      setLoading(true)
      try {
        content = await uploadToTelegraph(file)
      } catch {
        setLoading(false)
        setError('Rasm yuklab bo\'lmadi. Internet ulanishini tekshiring.')
        return
      }
    }

    setLoading(true)
    try {
      const res = await fetch('/api/qr/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, content, label: label || undefined }),
      })
      if (!res.ok) throw new Error('Server xatosi')
      const data: QrResult = await res.json()
      setResult(data)
    } catch {
      setError('QR kod yasashda xato. Qayta urining.')
    } finally {
      setLoading(false)
    }
  }

  const download = () => {
    if (!result) return
    const a = document.createElement('a')
    a.href = result.qrDataUrl
    a.download = `qr-${result.id}.png`
    a.click()
  }

  const reset = () => {
    setResult(null)
    setText('')
    setLabel('')
    setFile(null)
    setPreview(null)
    setError('')
    setTab('text')
  }

  return (
    <main className={styles.main}>
      <div className={styles.wrapper}>

        {/* Header */}
        <div className={styles.header}>
          <div className={styles.badge}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
              <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="3" height="3" rx="0.5"/>
              <rect x="18" y="14" width="3" height="3" rx="0.5"/><rect x="14" y="18" width="3" height="3" rx="0.5"/>
              <rect x="18" y="18" width="3" height="3" rx="0.5"/>
            </svg>
            QR Kod Generatori
          </div>
          <h1 className={styles.title}>Matn yoki Rasm →<br/>QR Kod</h1>
          <p className={styles.subtitle}>Yaratilgan QR kodlar databaseda saqlanadi</p>
          <Link href="/history" className={styles.historyLink}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 8v4l3 3"/><circle cx="12" cy="12" r="9"/>
            </svg>
            Tarixni ko&apos;rish
          </Link>
        </div>

        {/* Input card */}
        <div className={styles.card}>
          {/* Tabs */}
          <div className={styles.tabs}>
            <button className={`${styles.tabBtn} ${tab === 'text' ? styles.active : ''}`} onClick={() => { setTab('text'); setError('') }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 6h16M4 12h10M4 18h6"/></svg>
              Matn
            </button>
            <button className={`${styles.tabBtn} ${tab === 'image' ? styles.active : ''}`} onClick={() => { setTab('image'); setError('') }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/>
              </svg>
              Rasm
            </button>
          </div>

          {/* Text panel */}
          {tab === 'text' && (
            <div className={styles.panel}>
              <label className={styles.fieldLabel}>Matn kiriting</label>
              <textarea
                className={styles.textarea}
                placeholder="https://youtube.com yoki +998901234567 yoki istalgan matn..."
                value={text}
                onChange={e => setText(e.target.value)}
                rows={5}
              />
              <p className={styles.hint}>💡 URL yozsangiz — telefon skaner qilganda o&apos;sha sahifa ochiladi!</p>
            </div>
          )}

          {/* Image panel */}
          {tab === 'image' && (
            <div className={styles.panel}>
              <label className={styles.fieldLabel}>Rasm tanlang</label>
              <div
                className={`${styles.dropZone} ${dragover ? styles.dragover : ''}`}
                onDragOver={e => { e.preventDefault(); setDragover(true) }}
                onDragLeave={() => setDragover(false)}
                onDrop={e => { e.preventDefault(); setDragover(false); const f = e.dataTransfer.files[0]; if (f?.type.startsWith('image/')) handleFile(f) }}
                onClick={() => fileRef.current?.click()}
              >
                <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => { if (e.target.files?.[0]) handleFile(e.target.files[0]) }} />
                <div className={styles.dzIcon}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="1.5">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                  </svg>
                </div>
                <h3>Rasmni bu yerga tashlang</h3>
                <p>yoki bosib faylni tanlang · PNG, JPG, WEBP</p>
              </div>
              {preview && (
                <div className={styles.imgPreview}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={preview} alt="preview" />
                  <button className={styles.removeBtn} onClick={() => { setFile(null); setPreview(null) }}>✕</button>
                </div>
              )}
              <p className={styles.hint}>📤 Rasm Telegraph serveriga yuklanadi va uning linki QR kodga aylanadi</p>
            </div>
          )}

          {/* Label */}
          <div style={{ marginTop: 16 }}>
            <label className={styles.fieldLabel}>Nom (ixtiyoriy)</label>
            <input
              className={styles.input}
              placeholder="Misol: Instagram havolam"
              value={label}
              onChange={e => setLabel(e.target.value)}
            />
          </div>

          {error && <div className={styles.errorMsg}>⚠ {error}</div>}

          <button className={`${styles.generateBtn} ${loading ? styles.loading : ''}`} onClick={generate} disabled={loading}>
            {loading ? (
              <><span className={styles.spinner}/> Yuklanmoqda...</>
            ) : (
              <><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
                <rect x="3" y="14" width="7" height="7" rx="1"/><path d="m14 14 2 2 4-4"/>
              </svg> QR Kod Yasash</>
            )}
          </button>
        </div>

        {/* Result */}
        {result && (
          <div className={styles.resultCard}>
            <div className={styles.resultLabel}>✦ Tayyor QR Kodingiz</div>
            {result.label && <p className={styles.resultTitle}>{result.label}</p>}
            <div className={styles.qrBox}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={result.qrDataUrl} alt="QR Code" width={240} height={240} />
            </div>
            <div className={styles.encodedUrl}>
              {result.type === 'image' ? '🖼️' : '📝'} QR ichida:{' '}
              {result.content.startsWith('http') ? (
                <a href={result.content} target="_blank" rel="noreferrer">{result.content.slice(0, 60)}{result.content.length > 60 ? '…' : ''}</a>
              ) : (
                <strong>{result.content.slice(0, 60)}{result.content.length > 60 ? '…' : ''}</strong>
              )}
            </div>
            <div className={styles.actions}>
              <button className={`${styles.actionBtn} ${styles.primary}`} onClick={download}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                Yuklab olish
              </button>
              <button className={styles.actionBtn} onClick={reset}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>
                </svg>
                Yangi QR
              </button>
              <Link href="/history" className={styles.actionBtn}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 8v4l3 3"/><circle cx="12" cy="12" r="9"/>
                </svg>
                Tarix
              </Link>
            </div>
          </div>
        )}

        <div className={styles.footer}>
          Barcha QR kodlar <span>Neon Database</span>da saqlanadi 🚀
        </div>
      </div>
    </main>
  )
}
