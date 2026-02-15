'use client'

import { useState } from 'react'
import {
    Plus,
    Search,
    MoreHorizontal,
    Loader2,
    ChevronDown,
    ChevronRight,
    Pencil,
    Trash2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'

import { cn } from '@/lib/utils'

interface Column {
    header: string
    key: string
    render?: (val: any, item: any) => React.ReactNode
}

interface Field {
    id: string
    label: string
    type?: string
    placeholder?: string
    required?: boolean
    options?: { label: string, value: any }[]
}

interface DataManagementTableProps {
    title: string
    subtitle: string
    icon: any
    columns: Column[]
    data: any[]
    loading: boolean
    onAdd: (formData: any) => Promise<void>
    onEdit?: (id: string, formData: any) => Promise<void>
    onDelete?: (id: string) => Promise<void>
    fields: Field[]
    searchKey?: string
    hierarchical?: boolean
}

export function DataManagementTable({
    title,
    subtitle,
    icon: Icon,
    columns,
    data,
    loading,
    onAdd,
    onEdit,
    onDelete,
    fields,
    searchKey = "name",
    hierarchical = false
}: DataManagementTableProps) {
    const [searchTerm, setSearchTerm] = useState('')
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
    const [isEditMode, setIsEditMode] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [formData, setFormData] = useState<any>({})
    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            setIsSubmitting(true)
            if (isEditMode && editingId && onEdit) {
                await onEdit(editingId, formData)
            } else {
                await onAdd(formData)
            }
            setIsAddDialogOpen(false)
            setFormData({})
            setIsEditMode(false)
            setEditingId(null)
        } finally {
            setIsSubmitting(false)
        }
    }

    const openEditDialog = (item: any) => {
        setFormData(item)
        setEditingId(item.id)
        setIsEditMode(true)
        setIsAddDialogOpen(true)
    }

    const toggleRow = (id: string) => {
        const newExpanded = new Set(expandedRows)
        if (newExpanded.has(id)) {
            newExpanded.delete(id)
        } else {
            newExpanded.add(id)
        }
        setExpandedRows(newExpanded)
    }

    const filteredData = data.filter(item =>
        item[searchKey]?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )

    // Tree logic
    const renderRows = (items: any[], level = 0, parentId: string | null = null): React.ReactNode => {
        const currentItems = items.filter(item => item.parent_id === parentId)

        return currentItems.map((item, i) => {
            const hasChildren = items.some(child => child.parent_id === item.id)
            const isExpanded = expandedRows.has(item.id)

            return (
                <>
                    <tr key={item.id} className="group hover:bg-foreground/[0.015] transition-all border-border/30 h-20">
                        {columns.map((col, j) => (
                            <td key={j} className="px-6">
                                <div className="flex items-center gap-2">
                                    {j === 0 && level > 0 && (
                                        <div style={{ width: `${level * 24}px` }} />
                                    )}
                                    {j === 0 && hasChildren && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6 rounded-md hover:bg-slate-100"
                                            onClick={() => toggleRow(item.id)}
                                        >
                                            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                        </Button>
                                    )}
                                    {j === 0 && !hasChildren && level > 0 && <div className="w-6" />}
                                    {col.render ? col.render(item[col.key], item) : (
                                        <div className="flex flex-col">
                                            <span className={cn(
                                                "text-[13px] font-medium text-slate-600 dark:text-slate-400",
                                                j === 0 && "text-slate-900 dark:text-slate-100 font-semibold"
                                            )}>
                                                {item[col.key] || "-"}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </td>
                        ))}
                        <td className="px-6 text-right">
                            <div className="flex items-center justify-end gap-2 transition-opacity">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 rounded-lg text-blue-500 hover:text-blue-600 hover:bg-blue-50"
                                    onClick={() => openEditDialog(item)}
                                >
                                    <Pencil className="h-4 w-4" />
                                </Button>
                                {onDelete && (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 rounded-lg text-red-500 hover:text-red-600 hover:bg-red-50"
                                        onClick={() => {
                                            if (confirm('Bạn có chắc chắn muốn xóa?')) {
                                                onDelete(item.id)
                                            }
                                        }}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                        </td>
                    </tr>
                    {isExpanded && renderRows(items, level + 1, item.id)}
                </>
            )
        })
    }

    return (
        <div className="p-4 space-y-6 font-sans max-w-full">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
                    <div className="relative flex-1 md:w-80 group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                        <Input
                            placeholder="Tìm kiếm..."
                            className="pl-10 h-10 bg-card/40 border-border/40 rounded-xl focus:ring-primary/10 shadow-sm transition-all text-[13px] font-medium placeholder:text-slate-400"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="h-10 rounded-xl px-5 bg-primary hover:bg-primary/95 text-primary-foreground shadow-md shadow-primary/10 font-medium transition-all active:scale-[0.98] text-xs flex items-center gap-2">
                                <Plus className="h-4 w-4" />
                                Thêm mới
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px] rounded-[1.5rem] border-border/40 bg-card">
                            <DialogHeader>
                                <DialogTitle className="text-lg font-bold">
                                    {isEditMode ? `Cập nhật ${title.toLowerCase()}` : `Thêm ${title.toLowerCase()} mới`}
                                </DialogTitle>
                                <DialogDescription className="text-xs">
                                    Nhập thông tin để quản lý hệ thống.
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleSubmit} className="space-y-4 py-4">
                                {fields.map((field) => (
                                    <div key={field.id} className="space-y-1.5">
                                        <Label htmlFor={field.id} className="text-[12px] font-semibold text-slate-600 pl-1">{field.label} {field.required && "*"}</Label>
                                        {field.type === 'select' ? (
                                            <select
                                                id={field.id}
                                                required={field.required}
                                                className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white dark:bg-slate-950 text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/20"
                                                value={formData[field.id] || ''}
                                                onChange={(e) => setFormData({ ...formData, [field.id]: e.target.value })}
                                            >
                                                <option value="">Chọn một giá trị...</option>
                                                {field.options?.map(opt => (
                                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                ))}
                                            </select>
                                        ) : (
                                            <Input
                                                id={field.id}
                                                type={field.type || "text"}
                                                placeholder={field.placeholder}
                                                required={field.required}
                                                className="h-10 rounded-xl text-[13px]"
                                                value={formData[field.id] || ''}
                                                onChange={(e) => setFormData({ ...formData, [field.id]: e.target.value })}
                                            />
                                        )}
                                    </div>
                                ))}
                                <DialogFooter className="pt-4">
                                    <Button type="submit" disabled={isSubmitting} className="w-full h-11 rounded-xl bg-primary text-sm font-bold shadow-lg shadow-primary/20">
                                        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                        Lưu dữ liệu
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <div className="rounded-[1.5rem] overflow-hidden border border-border/40 bg-card/30 shadow-sm">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="hover:bg-transparent border-border/40 bg-muted/10 h-14">
                            {columns.map((col, i) => (
                                <th key={i} className={cn(
                                    "px-6 font-semibold text-[13px] text-slate-700 dark:text-slate-300",
                                    col.key === 'actions' && "w-20"
                                )}>
                                    {col.header}
                                </th>
                            ))}
                            <th className="w-32 text-right px-6 font-semibold text-[13px] text-slate-700 dark:text-slate-300">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/30">
                        {loading ? (
                            Array(3).fill(0).map((_, i) => (
                                <tr key={i} className="animate-pulse h-20">
                                    {columns.map((_, j) => (
                                        <td key={j} className="px-6"><div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-full" /></td>
                                    ))}
                                    <td className="px-6"></td>
                                </tr>
                            ))
                        ) : filteredData.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length + 1} className="h-64 text-center text-muted-foreground/50">
                                    <div className="flex flex-col items-center gap-2">
                                        <p className="text-xs italic">Chưa có dữ liệu phù hợp</p>
                                    </div>
                                </td>
                            </tr>
                        ) : hierarchical ? (
                            renderRows(filteredData)
                        ) : (
                            filteredData.map((item, i) => (
                                <tr key={item.id || i} className="group hover:bg-foreground/[0.015] transition-all border-border/30 h-20">
                                    {columns.map((col, j) => (
                                        <td key={j} className="px-6">
                                            {col.render ? col.render(item[col.key], item) : (
                                                <div className="flex flex-col">
                                                    <span className={cn(
                                                        "text-[13px] font-medium text-slate-600 dark:text-slate-400",
                                                        j === 0 && "text-slate-900 dark:text-slate-100 font-semibold"
                                                    )}>
                                                        {item[col.key] || "-"}
                                                    </span>
                                                </div>
                                            )}
                                        </td>
                                    ))}
                                    <td className="px-6 text-right">
                                        <div className="flex items-center justify-end gap-2 transition-opacity">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 rounded-lg text-blue-500 hover:text-blue-600 hover:bg-blue-50"
                                                onClick={() => openEditDialog(item)}
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            {onDelete && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 rounded-lg text-red-500 hover:text-red-600 hover:bg-red-50"
                                                    onClick={() => {
                                                        if (confirm('Bạn có chắc chắn muốn xóa?')) {
                                                            onDelete(item.id)
                                                        }
                                                    }}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
