'use client'

import { useState, useEffect } from 'react'
import {
    FileText,
    Image as ImageIcon,
    Paperclip,
    Plus,
    Trash2,
    ExternalLink,
    Loader2,
    X,
    File as FileIcon
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { getFiles, addFile, deleteFile, FileRecord } from '@/lib/actions/files'
import { toast } from 'sonner'

interface AttachmentListProps {
    tableName: string
    refId: string
    title?: string
}

export function AttachmentList({ tableName, refId, title = "Tài liệu đính kèm" }: AttachmentListProps) {
    const [files, setFiles] = useState<FileRecord[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Form state
    const [newName, setNewName] = useState('')
    const [newUrl, setNewUrl] = useState('')
    const [newFileName, setNewFileName] = useState('')
    const [newType, setNewType] = useState<FileRecord['type']>('Tài liệu')

    useEffect(() => {
        loadFiles()
    }, [tableName, refId])

    async function loadFiles() {
        try {
            setIsLoading(true)
            const data = await getFiles(tableName, refId)
            setFiles(data)
        } catch (error) {
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleAddFile = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newName || !newUrl) {
            toast.error("Vui lòng nhập tên và đường dẫn tài liệu")
            return
        }

        try {
            setIsSubmitting(true)
            await addFile({
                name: newName,
                file_url: newUrl,
                file_name: newFileName || newName,
                type: newType,
                table_name: tableName,
                ref_id: refId
            })
            toast.success("Đã thêm tài liệu thành công")
            setIsAddDialogOpen(false)
            resetForm()
            loadFiles()
        } catch (error) {
            toast.error("Lỗi khi thêm tài liệu: " + (error instanceof Error ? error.message : "Chưa xác định"))
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDeleteFile = async (id: string) => {
        if (!confirm("Bạn có chắc chắn muốn xóa tài liệu này?")) return

        try {
            await deleteFile(id)
            toast.success("Đã xóa tài liệu")
            loadFiles()
        } catch (error) {
            toast.error("Lỗi khi xóa tài liệu")
        }
    }

    const resetForm = () => {
        setNewName('')
        setNewUrl('')
        setNewFileName('')
        setNewType('Tài liệu')
    }

    const getIcon = (type: string) => {
        switch (type) {
            case 'Ảnh': return <ImageIcon className="h-4 w-4" />
            case 'Tài liệu': return <FileText className="h-4 w-4" />
            default: return <Paperclip className="h-4 w-4" />
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-[13px] font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <Paperclip className="h-4 w-4 text-primary/70" />
                    {title}
                    {files.length > 0 && (
                        <Badge variant="secondary" className="ml-1 px-1.5 py-0 h-5 bg-slate-100 dark:bg-slate-800 text-slate-600 border-none font-bold text-[10px]">
                            {files.length}
                        </Badge>
                    )}
                </h3>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsAddDialogOpen(true)}
                    className="h-8 rounded-lg text-primary hover:text-primary hover:bg-primary/5 text-[12px] font-medium"
                >
                    <Plus className="h-3.5 w-3.5 mr-1" />
                    Thêm đính kèm
                </Button>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-5 w-5 animate-spin text-slate-300" />
                </div>
            ) : files.length === 0 ? (
                <div className="text-center py-8 bg-slate-50/50 dark:bg-slate-900/50 rounded-2xl border-2 border-dashed border-slate-100 dark:border-slate-800">
                    <FileIcon className="h-8 w-8 mx-auto text-slate-200 mb-2" />
                    <p className="text-[12px] text-slate-400">Chưa có tài liệu đính kèm.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {files.map((file) => (
                        <div
                            key={file.id}
                            className="group flex items-center justify-between p-3 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-xl hover:border-primary/30 transition-all shadow-sm"
                        >
                            <div className="flex items-center gap-3 min-w-0">
                                <div className="h-8 w-8 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-500 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                    {getIcon(file.type)}
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[13px] font-medium text-slate-900 dark:text-slate-100 truncate pr-2">
                                        {file.name}
                                    </p>
                                    <p className="text-[10px] text-slate-400 truncate">
                                        {file.file_name}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button size="icon" variant="ghost" className="h-7 w-7 rounded-md" asChild>
                                    <a href={file.file_url} target="_blank" rel="noopener noreferrer">
                                        <ExternalLink className="h-3.5 w-3.5" />
                                    </a>
                                </Button>
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-7 w-7 rounded-md text-rose-500 hover:text-rose-600 hover:bg-rose-50"
                                    onClick={() => handleDeleteFile(file.id)}
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add File Dialog */}
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogContent className="sm:max-w-[480px] rounded-3xl p-0 overflow-hidden border-none shadow-2xl">
                    <DialogHeader className="bg-slate-50 dark:bg-slate-900/50 p-8 border-b border-slate-100 dark:border-slate-800">
                        <DialogTitle className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-50 flex items-center gap-3">
                            <Plus className="h-5 w-5 text-primary" />
                            Thêm tài liệu mới
                        </DialogTitle>
                        <DialogDescription className="text-[13px] text-slate-500">
                            Nhập thông tin tài liệu đính kèm cho nghiệp vụ này.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleAddFile} className="p-8 space-y-5">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">Tên tài liệu *</label>
                                <Input
                                    placeholder="VD: Hợp đồng đợt 1, Ảnh hiện trạng..."
                                    className="h-11 rounded-xl border-slate-200 focus:ring-primary/20"
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 ml-1">Loại tài liệu</label>
                                    <select
                                        className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-white dark:bg-slate-950 text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/20"
                                        value={newType}
                                        onChange={(e) => setNewType(e.target.value as any)}
                                    >
                                        <option value="Tài liệu">Tài liệu (PDF/Docs)</option>
                                        <option value="Ảnh">Ảnh (JPG/PNG)</option>
                                        <option value="Đính kèm">Đính kèm khác</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 ml-1">Đường dẫn gốc (PC)</label>
                                    <Input
                                        placeholder="C:\Documents\file.pdf"
                                        className="h-11 rounded-xl border-slate-200"
                                        value={newFileName}
                                        onChange={(e) => setNewFileName(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 ml-1">Link tài liệu (URL) *</label>
                                <Input
                                    placeholder="https://drive.google.com/..."
                                    className="h-11 rounded-xl border-slate-200"
                                    value={newUrl}
                                    onChange={(e) => setNewUrl(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <DialogFooter className="pt-4">
                            <Button
                                type="button"
                                variant="ghost"
                                className="h-11 rounded-xl px-6"
                                onClick={() => setIsAddDialogOpen(false)}
                            >
                                Hủy
                            </Button>
                            <Button
                                type="submit"
                                className="h-11 rounded-xl px-8 shadow-lg shadow-primary/20 min-w-[120px]"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                                Lưu tài liệu
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}
