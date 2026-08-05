import Link from 'next/link'

export default function ContactSection() {
  return (
    <section id="contact" className="py-section-v-padding overflow-hidden relative bg-surface-container-lowest">
      <div className="marquee-container py-12">
        <div className="marquee-content">
          <span className="font-display-xl text-[100px] md:text-[180px] uppercase text-foreground tracking-tighter mx-8">CONTACT</span>
          <span className="font-display-xl text-[100px] md:text-[180px] uppercase text-foreground tracking-tighter mx-8">CONTACT</span>
          <span className="font-display-xl text-[100px] md:text-[180px] uppercase text-foreground tracking-tighter mx-8">CONTACT</span>
          <span className="font-display-xl text-[100px] md:text-[180px] uppercase text-foreground tracking-tighter mx-8">CONTACT</span>
        </div>
      </div>

      <div className="px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto text-center mt-8">
        <p className="font-subtext-jp text-subtext-jp text-on-surface-variant mb-12">
          お仕事のご相談、お気軽にどうぞ。
        </p>
        <Link
          href="/contact"
          className="contact-cta inline-block rounded-full bg-tertiary text-on-tertiary px-16 py-6 font-label-mono text-[18px] font-bold uppercase tracking-widest hover:scale-[1.02] transition-transform duration-300"
        >
          Contact →
        </Link>
      </div>
    </section>
  )
}
