import { getPYCById } from '@/lib/actions/pyc'
import { PYCPrintClient } from '@/components/pyc/pyc-print-client'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

interface PrintPageProps {
    params: Promise<{
        id: string[]
    }>
}

export default async function PYCPrintPage({ params }: PrintPageProps) {
    const { id } = await params

    // Auth Check since we are outside /dashboard
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    // Join the ID segments (handles slashes in requestId)
    const requestId = decodeURIComponent(id.join('/'))
    console.log('Printing PYC:', requestId)

    const pyc = await getPYCById(requestId)

    if (!pyc) {
        console.error('PYC not found in DB:', requestId)
        notFound()
    }

    // Transform data for the preview component
    const previewData = {
        request_id: pyc.request_id,
        title: pyc.title,
        project_name: pyc.projects?.project_name || 'Dùng chung',
        project_code: pyc.projects?.project_code || pyc.project_id || 'GENERAL',
        department: 'Phòng Dự Án',
        requester_name: pyc.author?.full_name || '---',
        created_at: pyc.created_at,
        details: pyc.pyc_detail || []
    }

    return (
        <PYCPrintClient data={previewData} />
    )
}
