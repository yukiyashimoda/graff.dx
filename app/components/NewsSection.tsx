import { getAllNews } from '@/app/lib/db'
import NewsSectionClient from './NewsSectionClient'

export default async function NewsSection() {
  const news = await getAllNews()
  return <NewsSectionClient news={news} />
}
