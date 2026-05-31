'use client'

export default function DeleteButton({ action, label = 'Delete' }: { action: () => Promise<void>; label?: string }) {
  return (
    <button
      onClick={async () => {
        if (!confirm('削除しますか？')) return
        await action()
      }}
      className="px-3 py-1 border border-outline-variant rounded text-[10px] uppercase tracking-widest hover:border-red-500 hover:text-red-400 transition-colors"
    >
      {label}
    </button>
  )
}
