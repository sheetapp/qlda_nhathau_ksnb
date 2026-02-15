import { getResources } from '@/lib/actions/resources'
import { getUsers, getProjects } from '@/lib/actions/projects'
import { ResourceList } from '@/components/resources/resource-list'

export default async function ResourcesPage() {
    const [users, projects] = await Promise.all([
        getUsers(),
        getProjects()
    ])

    return (
        <div className="p-4">
            <ResourceList
                users={users}
                projects={projects}
            />
        </div>
    )
}
