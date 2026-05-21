export default function SiteFooter() {
  return (
    <footer className="bg-surface-container-lowest border-t border-outline-variant/20">
      <div className="flex flex-col md:flex-row justify-between items-center px-margin-mobile md:px-margin-desktop py-gutter gap-gutter max-w-container-max mx-auto">
        <div className="font-display-lg text-display-lg-mobile text-primary">GRAFF.</div>
        <div className="flex flex-wrap justify-center gap-8 font-label-sm text-label-sm tracking-[0.15em] uppercase">
          <a className="text-on-surface-variant hover:text-primary-fixed transition-all duration-300" href="#news">NEWS</a>
          <a className="text-primary font-bold" href="#works">WORKS</a>
          <a className="text-on-surface-variant hover:text-primary-fixed transition-all duration-300" href="#contact">CONTACT</a>
        </div>
        <div className="font-label-sm text-[10px] text-on-surface-variant opacity-50 uppercase tracking-[0.2em]">
          © 2024 GRAFF. DESIGN STUDIO. ALL RIGHTS RESERVED.
        </div>
      </div>
    </footer>
  )
}
