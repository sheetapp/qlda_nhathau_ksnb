import { getProjectItems } from '@/lib/actions/project-items'
import { getProjects } from '@/lib/actions/projects'
import { ProjectItemList } from '@/components/projects/project-item-list'

export default async function ProjectItemsPage() {
    const [projectItems, allProjects] = await Promise.all([
        getProjectItems(),
        getProjects()
    ])

    return (
        <div className="p-6">
            <ProjectItemList initialItems={projectItems} projects={allProjects} />
        </div>
    )
}
