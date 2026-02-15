import { getPersonnel } from '@/lib/actions/personnel'
import { getProjects } from '@/lib/actions/projects'
import { PersonnelList } from '@/components/personnel/personnel-list'

export default async function PersonnelPage() {
    const [personnelResult, projects] = await Promise.all([
        getPersonnel(null, 1, 20), // Fetch first page with 20 items
        getProjects()
    ])

    const personnelData = personnelResult.data.map(u => ({
        email: u.email,
        fullName: u.full_name,
        phoneNumber: u.phone_number,
        avatarUrl: u.avatar_url,
        department: u.department,
        position: u.position,
        accessLevel: u.access_level,
        projectIds: u.project_ids || [],
    }))

    return (
        <div className="p-4">
            <PersonnelList
                initialUsers={[]}
                projects={projects}
            />
        </div>
    )
}
