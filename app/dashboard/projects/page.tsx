import { createClient } from '@/lib/supabase/server'
import { ProjectList } from '@/components/projects/project-list'
import { AddProjectButton } from '@/components/projects/add-project-button'

export default async function ProjectsPage() {
  const supabase = await createClient()

  const { data: projects } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false })

  const { data: users } = await supabase
    .from('users')
    .select('*')
    .order('full_name', { ascending: true })

  return (
    <div className="p-4">
      <ProjectList
        initialProjects={projects || []}
        users={users || []}
      />
    </div>
  )
}
