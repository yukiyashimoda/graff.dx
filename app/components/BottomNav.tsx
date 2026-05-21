export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center py-4 px-margin-mobile md:hidden glass-panel border-t border-outline-variant/30 shadow-[0_-10px_40px_rgba(0,224,184,0.1)] rounded-t-xl">
      <a className="flex flex-col items-center justify-center text-on-surface-variant opacity-60 hover:opacity-100 transition-opacity" href="#news">
        <span className="material-symbols-outlined">newspaper</span>
        <span className="font-label-sm text-[10px] mt-1">News</span>
      </a>
      <a className="flex flex-col items-center justify-center text-primary-fixed scale-110 transition-transform" href="#works">
        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>gallery_thumbnail</span>
        <span className="font-label-sm text-[10px] mt-1">Works</span>
      </a>
      <a className="flex flex-col items-center justify-center text-on-surface-variant opacity-60 hover:opacity-100 transition-opacity" href="#contact">
        <span className="material-symbols-outlined">mail</span>
        <span className="font-label-sm text-[10px] mt-1">Contact</span>
      </a>
    </nav>
  )
}
