export default function SiteFooter() {
  return (
    <footer className="bg-background border-t border-outline-variant w-full py-section-v-padding px-margin-mobile md:px-margin-desktop">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter max-w-container-max mx-auto">
        {/* ブランド */}
        <div>
          <div className="font-headline-md text-body-main font-bold text-foreground mb-8">graff</div>
          <p className="font-body-sm text-body-sm text-on-surface-variant max-w-[240px]">
            Visualizing the field through structure and digital craftsmanship.
          </p>
        </div>

        {/* ナビ */}
        <div className="grid grid-cols-2 gap-8 font-label-mono text-label-mono uppercase tracking-widest">
          <div className="flex flex-col gap-4">
            <a className="text-on-surface-variant hover:text-accent-neon transition-colors" href="#">HOME</a>
            <a className="text-on-surface-variant hover:text-accent-neon transition-colors" href="#">ABOUT</a>
            <a className="text-on-surface-variant hover:text-accent-neon transition-colors" href="#">WORKS</a>
          </div>
          <div className="flex flex-col gap-4">
            <a className="text-on-surface-variant hover:text-accent-neon transition-colors" href="#">X</a>
            <a className="text-on-surface-variant hover:text-accent-neon transition-colors" href="#">GITHUB</a>
            <a className="text-on-surface-variant hover:text-accent-neon transition-colors" href="#">NOTE</a>
          </div>
        </div>

        {/* コピーライト + アイコン */}
        <div className="flex flex-col justify-between md:items-end">
          <div className="font-body-sm text-body-sm text-on-surface-variant md:text-right">
            Copyright © 2026 graff
          </div>
          <div className="flex gap-4 mt-8 md:mt-0">
            <div className="w-10 h-10 border border-outline-variant flex items-center justify-center text-on-surface-variant hover:border-accent-neon hover:text-accent-neon transition-colors cursor-pointer">
              <span className="material-symbols-outlined text-[18px]">language</span>
            </div>
            <div className="w-10 h-10 border border-outline-variant flex items-center justify-center text-on-surface-variant hover:border-accent-neon hover:text-accent-neon transition-colors cursor-pointer">
              <span className="material-symbols-outlined text-[18px]">mail</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
