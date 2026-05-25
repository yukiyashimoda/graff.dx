'use client'
import { useRef } from 'react'

const items = [
  {
    num: '01', title: 'graff.bms',
    src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBD088YnmwlwROwvF6rkxwn_WE8mqfYg4X-W4BA8FFErofHLWZc2iRbFf8cDSL5BuRQVRW0WlOd3FcfsN7qTy22uI-9cn7Z3NcrUN8Rj_LJ1iLmfcuRTEAjozJ54IwyuQjnI5F34tVTU8z7suBDMbftL2Gkpu_gb74_6OzmwnogmGrzCNbw8Xln5uFnHR82V_FRly3sjXGxoI-eXSCVA7rsDR2S4mGzogbZ2NkFDRaoEVTZgf9NAI_uyfHT9SWk6h2wC3jE98zC-o3I',
  },
  {
    num: '02', title: 'ichiyanagi-clinic',
    src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAfyfBfAv7GnMVH97slZXMQzjPqQ45v_T-aKzBeDi_cfu1hTyqDBMs5IU9ITaFBsX9VRczAyNkizETsYhsTT4dv4zR7LSmb12csb-vScF9cuRb6uSOlzkXGsSfZ75TsaUc6IkoQNV0zAd8x-wsyhw4K_xnDnEc1tzmGSI782oYndhjL05MwxymWCd0eBXrne4aPwtWalt4aKx7Hh0zWUs-JGgcU2FMblHjEmZ1wM9TIjMHfsd-LfpuqDsVQmdeHfijUYCwntR7xifqE',
  },
  {
    num: '03', title: 'Trioki',
    src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDo6e0TX2L1nO8-jaGPHR8p1IePMszGZPxS2u3eJghYl9-4vnsjsPchpxxsfYWbWj33KJFhRZIo2-LysZ8LE6y6KWLptYyYcUZ0uDr7u2-0Kd0hUzc4T0MsitbtUrp7SThmqXzahbw7C8jeUzfTo1vh8HbyN4mf2Vwn2VLImAB9hkXHQrm6QFp6_E3_OAQSWok3kjD-Kzjs-1Phm3rzftGqnhYlCbJvChOM11zvYyobUhFwaPXZBPZ_kwH08nSBnzjHZKcU0wuidl2N',
  },
]

export default function CarouselSection() {
  const sliderRef = useRef<HTMLDivElement>(null)
  const drag = useRef({ active: false, startX: 0, scrollLeft: 0 })

  const onDown = (e: React.MouseEvent) => {
    if (!sliderRef.current) return
    drag.current = {
      active: true,
      startX: e.pageX - sliderRef.current.offsetLeft,
      scrollLeft: sliderRef.current.scrollLeft,
    }
  }
  const onLeave = () => { drag.current.active = false }
  const onUp    = () => { drag.current.active = false }
  const onMove  = (e: React.MouseEvent) => {
    if (!drag.current.active || !sliderRef.current) return
    e.preventDefault()
    const x = e.pageX - sliderRef.current.offsetLeft
    sliderRef.current.scrollLeft = drag.current.scrollLeft - (x - drag.current.startX) * 2
  }

  return (
    <section className="py-section-v-padding overflow-hidden">
      <div className="px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto mb-12">
        <span className="font-label-mono text-label-mono uppercase tracking-widest text-on-surface-variant flex items-center gap-2">
          <span className="material-symbols-outlined text-sm">drag_pan</span> Drag to explore
        </span>
      </div>

      <div
        ref={sliderRef}
        className="flex gap-gutter overflow-x-auto no-scrollbar px-margin-mobile md:px-margin-desktop cursor-grab active:cursor-grabbing select-none"
        onMouseDown={onDown}
        onMouseLeave={onLeave}
        onMouseUp={onUp}
        onMouseMove={onMove}
      >
        {items.map((item) => (
          <div key={item.num} className="flex-none w-[300px] md:w-[600px]">
            <div className="aspect-video bg-muted-gray mb-6 relative overflow-hidden group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                className="w-full h-full object-cover filter grayscale hover:grayscale-0 transition-all duration-700 pointer-events-none"
                src={item.src}
                alt={item.title}
                draggable={false}
              />
              <div className="absolute inset-0 bg-accent-neon/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            </div>
            <div className="flex items-baseline gap-4">
              <span className="font-label-mono text-label-mono text-on-surface-variant">{item.num}</span>
              <h4 className="font-headline-md text-[24px] uppercase">{item.title}</h4>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
