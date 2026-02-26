import { getProjects } from '@/lib/actions/projects'
import { CampaignForm } from '@/components/marketing/campaign-form'

export default async function NewCampaignPage() {
    const projects = await getProjects()

    return (
        <div className="flex flex-col gap-6 p-4 pb-20">
            <CampaignForm projects={projects} />
        </div>
    )
}
