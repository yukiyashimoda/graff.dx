import WorkForm from '../../_components/WorkForm'
import { createWork } from '@/app/actions/admin'

export default function NewWorkPage() {
  return (
    <div>
      <h1 className="text-xs uppercase tracking-widest text-on-surface-variant mb-8">Works — New</h1>
      <WorkForm action={createWork} />
    </div>
  )
}
