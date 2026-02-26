import { CampaignList } from '@/components/marketing/campaign-list'
import { getProjects } from '@/lib/actions/projects'
import { getAllCampaigns } from '@/lib/actions/marketing'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'

export default async function MarketingPage() {
    const [campaigns, projects] = await Promise.all([
        getAllCampaigns(null),
        getProjects()
    ])

    return (
        <div className="flex flex-col gap-6 p-4 pb-20">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Chiến Dịch Marketing</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Quản lý chiến dịch email, SMS, social media và landing page
                    </p>
                </div>
                <Link href="/dashboard/app-store/marketing/new">
                    <Button className="rounded-lg gap-2 shadow-sm">
                        <Plus className="h-4 w-4" />
                        Tạo chiến dịch
                    </Button>
                </Link>
            </div>

            {/* Campaign List */}
            <CampaignList
                campaigns={campaigns}
                projects={projects}
            />
        </div>
    )
}
