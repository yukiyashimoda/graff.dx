import { getPublishedWorks } from '@/app/lib/db'
import CarouselClient from './CarouselClient'

export default async function CarouselSection() {
  const works = await getPublishedWorks()
  return <CarouselClient works={works} />
}
