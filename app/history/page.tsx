'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import styles from './history.module.css'

interface QrCode {
  id: string
  type: string
  content: string
  qrDataUrl: string
  label: string | null
  createdAt: string
}

export default function HistoryPage() {
  const [items, setItems] = useState<QrCode[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/qr/history')
      const data = await res.json()
      setItems(data)
    } catch {
      setItems([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const deleteItem = async (id: string) => {
    if (!confirm("Bu QR kodni o'chirmoqchimisiz?")) return
    setDeleting(id)
    try {
      await fetch(`/api/qr/${id}`, { method: 'DELETE' })
      setItems(prev => prev.filter(i => i.id !== id))
    } finally {
      setDeleting(null)
    }
  }

  const download = (item: QrCode) => {
    const a = document.createElement('a')
    a.href = item.qrDataUrl
    a.download = `qr-${item.label || item.id}.png`
    a.click()
  }

  const formatDate = (s: string) => {
    const d = new Date(s)
    return d.toLocaleDateString('uz-UZ', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  return (
    <main className={styles.main}>
      <div className={styles.wrapper}>
        {/* Header */}
        <div className={styles.header}>
          <Link href="/" className={styles.backBtn}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5"/><path d="m12 19-7-7 7-7"/>
            </svg>
            Orqaga
          </Link>
          <h1 className={styles.title}>QR Kod Tarixi</h1>
          <p className={styles.subtitle}>{items.length} ta QR kod saqlangan</p>
        </div>

        {/* Loading */}
        {loading && (
          <div className={styles.center}>
            <div className={styles.spinner}/>
            <p style={{ color: 'var(--muted)', marginTop: 16 }}>Yuklanmoqda...</p>
          </div>
        )}

        {/* Empty */}
        {!loading && items.length === 0 && (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="1.5">
                <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
                <rect x="3" y="14" width="7" height="7" rx="1"/>
              </svg>
            </div>
            <h3>Hali QR kod yo&apos;q</h3>
            <p>Birinchi QR kodingizni yarating!</p>
            <Link href="/" className={styles.createBtn}>QR kod yasash</Link>
          </div>
        )}

        {/* Grid */}
        {!loading && items.length > 0 && (
          <div className={styles.grid}>
            {items.map(item => (
              <div key={item.id} className={styles.qrCard}>
                <div className={styles.qrImg}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.qrDataUrl} alt="QR" width={160} height={160} />
                </div>
                <div className={styles.qrInfo}>
                  <div className={styles.qrLabel}>
                    {item.label ? item.label : (item.type === 'image' ? '🖼️ Rasm' : '📝 Matn')}
                  </div>
                  <div className={styles.qrContent}>
                    {item.content.startsWith('http') ? (
                      <a href={item.content} target="_blank" rel="noreferrer">
                        {item.content.slice(0, 40)}{item.content.length > 40 ? '…' : ''}
                      </a>
                    ) : (
                      item.content.slice(0, 40) + (item.content.length > 40 ? '…' : '')
                    )}
                  </div>
                  <div className={styles.qrDate}>{formatDate(item.createdAt)}</div>
                  <div className={styles.qrActions}>
                    <button className={styles.dlBtn} onClick={() => download(item)}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                      </svg>
                      Yuklash
                    </button>
                    <button
                      className={styles.delBtn}
                      onClick={() => deleteItem(item.id)}
                      disabled={deleting === item.id}
                    >
                      {deleting === item.id ? '...' : (
                        <>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                          </svg>
                          O&apos;chirish
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
