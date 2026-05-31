import { getAllServices } from '@/app/lib/db'
import WorksSectionClient from './WorksSectionClient'

export default async function WorksSection() {
  const services = await getAllServices()
  return <WorksSectionClient services={services} />
}
