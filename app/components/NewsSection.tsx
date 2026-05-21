import ScrollReveal from './ScrollReveal'

const news = [
  { date: 'AUG 24, 2024', title: "Awarded 'Studio of the Month' by AWWWARDS" },
  { date: 'JUL 12, 2024', title: "Behind the Scenes: The 'Legacy' Project" },
  { date: 'JUN 05, 2024', title: 'New Tokyo Studio Opening in Shibuya' },
]

export default function NewsSection() {
  return (
    <section className="py-32 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto" id="news">
      <h2 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-primary uppercase mb-12">
        Latest News
      </h2>
      <div>
        {news.map((item, i) => (
          <ScrollReveal key={i}>
            <article className="group py-12 border-b border-outline-variant/20 flex flex-col md:flex-row gap-8 items-start md:items-center hover:px-8 transition-all duration-500 cursor-pointer">
              <span className="font-label-sm text-label-sm text-on-surface-variant w-32 shrink-0">{item.date}</span>
              <h3 className="flex-1 font-headline-lg text-headline-lg-mobile text-primary group-hover:text-primary-fixed transition-colors">
                {item.title}
              </h3>
              <span className="material-symbols-outlined text-primary opacity-0 group-hover:opacity-100 -rotate-45 group-hover:rotate-0 transition-all">
                arrow_forward
              </span>
            </article>
          </ScrollReveal>
        ))}
      </div>
    </section>
  )
}
