import { notFound } from 'next/navigation'
import WorkForm from '../../_components/WorkForm'
import { getWorkById } from '@/app/lib/db'
import { updateWork } from '@/app/actions/admin'

export default async function EditWorkPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const work = await getWorkById(Number(id))
  if (!work) notFound()

  return (
    <div>
      <h1 className="text-xs uppercase tracking-widest text-on-surface-variant mb-8">Works — Edit</h1>
      <WorkForm action={updateWork} work={work} />
    </div>
  )
}
