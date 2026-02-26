import { getCampaignById } from '@/lib/actions/marketing'
import { getProjects as getProjectsList } from '@/lib/actions/projects'
import { CampaignForm } from '@/components/marketing/campaign-form'
import { notFound } from 'next/navigation'

interface EditCampaignPageProps {
    params: {
        id: string
    }
}

export default async function EditCampaignPage({ params }: EditCampaignPageProps) {
    const [campaign, projects] = await Promise.all([
        getCampaignById(params.id),
        getProjectsList()
    ])

    if (!campaign) {
        notFound()
    }

    return (
        <div className="flex flex-col gap-6 p-4 pb-20">
            <CampaignForm campaign={campaign} projects={projects} isEdit />
        </div>
    )
}
