'use client'

import { useState, useRef, useCallback } from 'react'

type UploadedImage = { url: string; uploading?: boolean; error?: string; originalSize?: number; compressedSize?: number }

const MAX_WIDTH  = 2000
const QUALITY    = 0.85
const SKIP_BYTES = 300 * 1024 // 300KB 以下はそのまま送る

async function compress(file: File): Promise<File> {
  return new Promise((resolve) => {
    const img = new Image()
    const blobUrl = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(blobUrl)

      let { width, height } = img
      if (width <= MAX_WIDTH && file.size <= SKIP_BYTES) {
        resolve(file)
        return
      }

      if (width > MAX_WIDTH) {
        height = Math.round(height * MAX_WIDTH / width)
        width  = MAX_WIDTH
      }

      const canvas  = document.createElement('canvas')
      canvas.width  = width
      canvas.height = height
      canvas.getContext('2d')!.drawImage(img, 0, 0, width, height)

      canvas.toBlob(
        (blob) => {
          if (!blob || blob.size >= file.size) { resolve(file); return }
          resolve(new File([blob], file.name.replace(/\.[^.]+$/, '.webp'), { type: 'image/webp' }))
        },
        'image/webp',
        QUALITY,
      )
    }

    img.onerror = () => { URL.revokeObjectURL(blobUrl); resolve(file) }
    img.src = blobUrl
  })
}

export default function ImageUploader({ defaultImages = [] }: { defaultImages?: string[] }) {
  const [images, setImages]   = useState<UploadedImage[]>(defaultImages.map(url => ({ url })))
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const upload = useCallback(async (files: FileList | File[]) => {
    const list = Array.from(files)
    const placeholders: UploadedImage[] = list.map(() => ({ url: '', uploading: true }))
    setImages(prev => [...prev, ...placeholders])
    const startIdx = images.length

    await Promise.all(list.map(async (raw, i) => {
      try {
        const file = await compress(raw)
        const fd   = new FormData()
        fd.append('file', file)

        const res  = await fetch('/api/admin/upload', { method: 'POST', body: fd })
        const data = await res.json()

        setImages(prev => {
          const next = [...prev]
          next[startIdx + i] = data.error
            ? { url: '', error: data.error }
            : { url: data.url, originalSize: raw.size, compressedSize: file.size }
          return next
        })
      } catch {
        setImages(prev => {
          const next = [...prev]
          next[startIdx + i] = { url: '', error: 'アップロード失敗' }
          return next
        })
      }
    }))
  }, [images.length])

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragging(false)
    if (e.dataTransfer.files.length) upload(e.dataTransfer.files)
  }

  const remove = (idx: number) => setImages(prev => prev.filter((_, i) => i !== idx))

  const urls = images.filter(img => img.url && !img.uploading).map(img => img.url)

  const kb = (n?: number) => n ? `${Math.round(n / 1024)}KB` : ''

  return (
    <div className="space-y-3">
      <input type="hidden" name="images" value={JSON.stringify(urls)} />

      {images.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {images.map((img, i) => (
            <div key={i} className="relative w-28 h-20 bg-surface-container border border-outline-variant rounded overflow-hidden flex items-center justify-center group/thumb">
              {img.uploading ? (
                <span className="text-[10px] text-on-surface-variant/50 uppercase tracking-widest animate-pulse">uploading…</span>
              ) : img.error ? (
                <span className="text-[10px] text-red-400 px-1 text-center">{img.error}</span>
              ) : (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                  {img.originalSize && img.compressedSize && img.originalSize !== img.compressedSize && (
                    <div className="absolute bottom-0 left-0 right-0 bg-background/80 px-1 py-0.5 text-[9px] text-accent-neon text-center opacity-0 group-hover/thumb:opacity-100 transition-opacity">
                      {kb(img.originalSize)} → {kb(img.compressedSize)}
                    </div>
                  )}
                </>
              )}
              {!img.uploading && (
                <button
                  type="button"
                  onClick={() => remove(i)}
                  className="absolute top-1 right-1 w-5 h-5 rounded-full bg-background/80 text-on-surface text-[10px] flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <div
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded px-6 py-8 text-center cursor-pointer transition-colors ${
          dragging ? 'border-accent-neon bg-accent-neon/5' : 'border-outline-variant hover:border-on-surface-variant/50'
        }`}
      >
        <p className="text-[11px] uppercase tracking-widest text-on-surface-variant">
          ドラッグ &amp; ドロップ、またはクリックして選択
        </p>
        <p className="text-[10px] text-on-surface-variant/40 mt-1">
          JPEG / PNG / WebP — 自動圧縮（最大 {MAX_WIDTH}px / WebP {QUALITY * 100}%）
        </p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        multiple
        className="hidden"
        onChange={e => { if (e.target.files?.length) upload(e.target.files) }}
      />
    </div>
  )
}
