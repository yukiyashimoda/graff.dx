import ScrollReveal from './ScrollReveal'

const services = [
  {
    icon: 'brush',
    iconColor: 'text-primary-fixed',
    title: 'Graphic Design',
    desc: 'Crafting visual identities that resonate. From bold typography to avant-garde brand guidelines, we build the visual core of your brand.',
    tags: ['Identity', 'Editorial'],
    delay: 0,
  },
  {
    icon: 'terminal',
    iconColor: 'text-surface-tint',
    title: 'Web Design',
    desc: 'High-performance digital stages. We specialize in glassmorphic interfaces and cinematic interactions that provide immersive user journeys.',
    tags: ['UI/UX', 'Futurism'],
    delay: 0.1,
  },
  {
    icon: 'strategy',
    iconColor: 'text-secondary-fixed-dim',
    title: 'Planner',
    desc: 'Strategic vision for creative projects. We plan the narrative arc of your campaign to ensure every asset serves the ultimate creative goal.',
    tags: ['Strategy', 'Art Direct'],
    delay: 0.2,
  },
]

export default function ServicesSection() {
  return (
    <section className="py-32 bg-surface-container-lowest border-y border-outline-variant/10">
      <div className="px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
          {services.map((s, i) => (
            <ScrollReveal key={i} delay={s.delay}>
              <span className={`material-symbols-outlined text-4xl ${s.iconColor} mb-6 block`}>{s.icon}</span>
              <h3 className="font-headline-lg text-headline-lg-mobile text-primary uppercase mb-4">{s.title}</h3>
              <p className="text-on-surface-variant leading-relaxed">{s.desc}</p>
              <div className="mt-6 flex flex-wrap gap-2">
                {s.tags.map((tag) => (
                  <span key={tag} className="px-3 py-1 border border-outline-variant text-[10px] font-label-sm uppercase tracking-tighter">
                    {tag}
                  </span>
                ))}
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  )
}
