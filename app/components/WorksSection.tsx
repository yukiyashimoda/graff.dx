import ScrollReveal from './ScrollReveal'

const works = [
  {
    colSpan: 'md:col-span-8',
    imgClass: 'w-full aspect-video object-cover',
    year: 'WEB DESIGN / 2024',
    title: 'Elysian Digital',
    src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCOg2KeDTiPbsGWk1vWCWyKFKFeml9OKV5L6_8Hzed-DoxxUDZ3G3e1LY-ZKN4apRY4-95SjYUkpDx_UVxxaf6ZHMKO9YwV-9Gw6gl6jlnAF-hbpJeaEYD7q7DHmT0bL0X9FjXjblfojKhcO_NMIIfs709wdOLf3FwNBq9SzKkZyp8IBM9A5iQPrPOgV7LON3beL6ykxPSrPZ-VxVvfVOxG9azl7tU8ehFWJISLlSnmo7I_W9hmNdAfUFF19AMh1NsvMBis1KlWvpV8',
  },
  {
    colSpan: 'md:col-span-4',
    imgClass: 'w-full aspect-video md:aspect-auto md:h-full object-cover',
    year: '3D ART',
    title: 'Void',
    src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAj5nhMMApzQwUFUL4XOKS8KxcfSkGKEBaVX07wnO5uwyTku7zZCPO-9ssFfBxrxT3ftIzxhH6gF2R0NJiHc5kxibzr7kJ9FNljHlqoSGcSoXQ5BFdTW78CsSoyw00baU_EtSykSClnw6B1hIns-bvfeSU4A20g7mQmljeIeWBUlzsW-lT7b70KnpJYd5uTxOY970e0m8TlOk-EOTSL4zCvmnnAa8POJESm8BDs_jLTaK4FxXlh98XtqQQzgoJeIeW-4FtFLuaNiJ35',
  },
  {
    colSpan: 'md:col-span-4',
    imgClass: 'w-full aspect-video md:aspect-auto md:h-full object-cover',
    year: 'PLANNER',
    title: 'Legacy',
    src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB0TOjK1kvoA86kAzZSyfLrL-SPgnaNHKIm5uxe_URe3DVihSpUoCVxoC75XoZFMEYg07doujv8QQajIp4ZmserB4RgdEhOPOJM9rDc7l--TDHCeGXuXcZb4-dS6kMAlV7ygx_uBAPtvydINXrD60_fbwFRftS61xkBnT194G8baiKWj5eH5_RUifCSPBxD0gayviu3UWLVD7NdKFv9SyJvDnwZ-ZkxJKvD-8IMrHN8RwHc8O5wdLTjT2EgRUY-9b0KR6j2862cPAlu',
  },
  {
    colSpan: 'md:col-span-8',
    imgClass: 'w-full aspect-video object-cover',
    year: 'GRAPHIC DESIGN',
    title: 'Synthesis',
    src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA0Bue7Q3JMgXZBe8edWMa-dCqnbNd8m4hkPKEJrZJHsLPWCDCuYDNUHEFnC1_WCCCiMSGfV_x3blKCKmPEDFSyBBTiLfqxxkMGvSjmvFGnhMk5ZpRWXHfqiHIf-SdNVJMFXJfABnTrgH-zDCEiKYEFjpCIbblDyMxfT84fNT7qGeSkyMCOI2YPJIb0WqV7wZ-IkMz2T8yb5JiGRIbzFGiV5FvTKjHFnbKhcuG0sKEzrCNMc2gJHhJ9aPFBqbZ1nAKbXi5Oq_C',
  },
]

export default function WorksSection() {
  return (
    <section className="py-32 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto" id="works">
      <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
        <div>
          <span className="font-label-sm text-label-sm text-primary-fixed tracking-[0.3em] uppercase">Portfolio</span>
          <h2 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-primary mt-2">Selected Works</h2>
        </div>
        <p className="font-body-lg text-on-surface-variant max-w-md">
          Exploring the intersection of cinematic aesthetics and functional digital interfaces. Each project is a unique visual narrative.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
        {works.map((work, i) => (
          <ScrollReveal key={i} className={work.colSpan}>
            <div className="group relative overflow-hidden bg-surface-container h-full">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                className={`${work.imgClass} grayscale group-hover:grayscale-0 transition-all duration-700 scale-100 group-hover:scale-110`}
                src={work.src}
                alt={work.title}
              />
              <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-gutter backdrop-blur-sm">
                <span className="font-label-sm text-label-sm text-primary-fixed mb-2">{work.year}</span>
                <h3 className="font-headline-lg text-headline-lg-mobile text-primary uppercase">{work.title}</h3>
              </div>
            </div>
          </ScrollReveal>
        ))}
      </div>
    </section>
  )
}
