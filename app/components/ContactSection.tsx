import ScrollReveal from './ScrollReveal'

export default function ContactSection() {
  return (
    <section className="py-32 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto text-center" id="contact">
      <ScrollReveal>
        <span className="font-label-sm text-label-sm text-primary-fixed tracking-[0.3em] uppercase block mb-8">
          Get in Touch
        </span>
        <a
          className="font-display-lg text-display-lg-mobile md:text-[120px] leading-none break-all text-primary hover:text-primary-fixed transition-colors duration-700"
          href="mailto:hello@graff.studio"
        >
          HELLO@GRAFF.STUDIO
        </a>
        <div className="mt-20 flex justify-center gap-16">
          {['Instagram', 'LinkedIn', 'Dribbble'].map((s) => (
            <a
              key={s}
              className="font-label-sm text-label-sm uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors"
              href="#"
            >
              {s}
            </a>
          ))}
        </div>
      </ScrollReveal>
    </section>
  )
}
