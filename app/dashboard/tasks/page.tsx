import { getTasks } from '@/lib/actions/tasks'
import { getProjects } from '@/lib/actions/projects'
import { TaskList } from '@/components/tasks/task-list'

export default async function TasksPage() {
    const projects = await getProjects()

    return (
        <div className="p-4">
            <TaskList
                projects={projects}
            />
        </div>
    )
}
