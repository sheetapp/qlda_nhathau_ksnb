'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { getAdminClient } from '@/lib/supabase/admin'

const adminClient = getAdminClient()

export type FileRecord = {
    id: string
    name: string
    description?: string
    type: 'Tài liệu' | 'Ảnh' | 'Đính kèm' | 'Khác'
    file_name: string
    file_url: string
    table_name: string
    ref_id: string
    created_at: string
    created_by?: string
}

/**
 * Get all files attached to a specific record
 */
export async function getFiles(tableName: string, refId: string) {
    const { data, error } = await adminClient
        .from('files')
        .select('*')
        .eq('table_name', tableName)
        .eq('ref_id', refId)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching files:', error)
        throw error
    }

    return data as FileRecord[]
}

/**
 * Add a new file record
 */
export async function addFile(data: Omit<FileRecord, 'id' | 'created_at'>) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { data: result, error } = await adminClient
        .from('files')
        .insert([{
            ...data,
            created_by: user?.id
        }])
        .select()
        .single()

    if (error) {
        console.error('Error adding file:', error)
        throw error
    }

    // Revalidate paths based on common usage
    revalidatePath(`/dashboard/projects`)

    return result as FileRecord
}

/**
 * Update a file record
 */
export async function updateFile(id: string, data: Partial<Omit<FileRecord, 'id' | 'created_at'>>) {
    const { error } = await adminClient
        .from('files')
        .update(data)
        .eq('id', id)

    if (error) {
        console.error('Error updating file:', error)
        throw error
    }
}

/**
 * Delete a file record
 */
export async function deleteFile(id: string) {
    const { error } = await adminClient
        .from('files')
        .delete()
        .eq('id', id)

    if (error) {
        console.error('Error deleting file:', error)
        throw error
    }
}
