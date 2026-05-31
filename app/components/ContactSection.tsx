import Link from 'next/link'

export default function ContactSection() {
  return (
    <section className="py-section-v-padding overflow-hidden relative bg-surface-container-lowest">
      <div className="marquee-container py-12">
        <div className="marquee-content">
          <span className="font-display-xl text-[100px] md:text-[180px] uppercase outline-text tracking-tighter mx-8">GETINTOUCH</span>
          <span className="font-display-xl text-[100px] md:text-[180px] uppercase outline-text tracking-tighter mx-8">GETINTOUCH</span>
          <span className="font-display-xl text-[100px] md:text-[180px] uppercase outline-text tracking-tighter mx-8">GETINTOUCH</span>
          <span className="font-display-xl text-[100px] md:text-[180px] uppercase outline-text tracking-tighter mx-8">GETINTOUCH</span>
        </div>
      </div>

      <div className="px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto text-center mt-8">
        <p className="font-subtext-jp text-subtext-jp text-on-surface-variant mb-12">
          お仕事のご相談、お気軽にどうぞ。
        </p>
        <Link
          href="/contact"
          className="inline-block bg-accent-neon text-background px-16 py-6 font-label-mono text-[18px] font-bold uppercase tracking-widest hover:scale-105 transition-transform duration-300"
        >
          Contact →
        </Link>
      </div>
    </section>
  )
}
