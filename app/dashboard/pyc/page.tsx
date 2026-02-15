import { getPYCs } from '@/lib/actions/pyc'
import { createClient } from '@/lib/supabase/server'
import { PYCContainer } from '@/components/pyc/pyc-container'
import { getPYCDetails } from '@/lib/actions/pyc'


export default async function PYCPage() {
    const supabase = await createClient()

    const pycs = await getPYCs()

    const { data: projects } = await supabase
        .from('projects')
        .select('project_id, project_name')
        .order('created_at', { ascending: false })

    const pycDetails = await getPYCDetails()
    const { data: personnel } = await supabase
        .from('users')
        .select('email, full_name, avatar_url')
        .order('full_name')

    return (
        <PYCContainer
            pycs={pycs || []}
            projects={projects || []}
            pycDetails={pycDetails || []}
            personnel={personnel || []}
        />
    )
}
