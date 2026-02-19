'use client'

import { useState, useEffect, useTransition } from 'react'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Plus,
    Search,
    Edit2,
    Trash2,
    Loader2,
    Wallet,
    ChevronLeft,
    ChevronRight,
    RotateCw
} from 'lucide-react'
import {
    getExpenseCategories,
    addExpenseCategory,
    updateExpenseCategory,
    deleteExpenseCategory
} from '@/lib/actions/system'
import { getProjects } from '@/lib/actions/projects'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export default function ExpenseManagementPage() {
    const [categories, setCategories] = useState<any[]>([])
    const [projects, setProjects] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [isPending, startTransition] = useTransition()
    const [searchTerm, setSearchTerm] = useState('')
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingCategory, setEditingCategory] = useState<any>(null)
    const [formData, setFormData] = useState({
        type_name: '',
        group_name: '',
        project_id: 'all'
    })

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        try {
            setLoading(true)
            const [cats, projs] = await Promise.all([
                getExpenseCategories(),
                getProjects()
            ])
            setCategories(cats || [])
            setProjects(projs || [])
        } catch (error) {
            toast.error("Lỗi khi tải dữ liệu")
        } finally {
            setLoading(false)
        }
    }

    const handleOpenDialog = (category?: any) => {
        if (category) {
            setEditingCategory(category)
            setFormData({
                type_name: category.type_name,
                group_name: category.group_name,
                project_id: category.project_id || 'all'
            })
        } else {
            setEditingCategory(null)
            setFormData({
                type_name: '',
                group_name: '',
                project_id: 'all'
            })
        }
        setIsDialogOpen(true)
    }

    const handleSubmit = async () => {
        if (!formData.type_name || !formData.group_name) {
            toast.error("Vui lòng nhập đầy đủ thông tin")
            return
        }

        try {
            startTransition(async () => {
                const data = {
                    ...formData,
                    project_id: formData.project_id === 'all' ? null : formData.project_id
                }

                if (editingCategory) {
                    await updateExpenseCategory(editingCategory.id, data)
                    toast.success("Cập nhật thành công")
                } else {
                    await addExpenseCategory(data)
                    toast.success("Thêm mới thành công")
                }
                setIsDialogOpen(false)
                loadData()
            })
        } catch (error) {
            toast.error("Lỗi khi lưu dữ liệu")
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Bạn có chắc chắn muốn xóa danh mục này?")) return

        try {
            await deleteExpenseCategory(id)
            toast.success("Đã xóa danh mục")
            loadData()
        } catch (error) {
            toast.error("Lỗi khi xóa dữ liệu")
        }
    }

    const filteredCategories = categories.filter(c =>
        c.type_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.group_name.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="p-4 md:p-6 lg:p-10 space-y-6 max-w-full font-inter">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="text-left">
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                        <Wallet className="h-6 w-6 text-primary" />
                        Quản lý chi phí
                    </h1>
                    <p className="text-[13px] text-slate-500 mt-1">Cấu hình danh mục loại chi phí và nhóm chi phí hệ thống.</p>
                </div>
                <Button
                    onClick={() => handleOpenDialog()}
                    className="rounded-xl bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 px-6"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Thêm danh mục
                </Button>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row gap-4 justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Tìm kiếm loại hoặc nhóm chi phí..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 h-11 rounded-xl border-slate-200 bg-white dark:bg-slate-950 shadow-sm focus:ring-primary/20"
                        />
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={loadData}
                        disabled={loading}
                        className="rounded-xl hover:bg-primary/5 text-slate-400 hover:text-primary transition-colors"
                    >
                        <RotateCw className={cn("h-4 w-4", loading && "animate-spin")} />
                    </Button>
                </div>

                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                                <TableHead className="w-[80px] text-center text-[11px] font-bold uppercase tracking-wider text-slate-500">STT</TableHead>
                                <TableHead className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Loại chi phí</TableHead>
                                <TableHead className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Nhóm chi phí</TableHead>
                                <TableHead className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Dự án áp dụng</TableHead>
                                <TableHead className="w-[120px] text-right text-[11px] font-bold uppercase tracking-wider text-slate-500">Thao tác</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-64 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <Loader2 className="h-8 w-8 animate-spin text-primary/30" />
                                            <p className="text-xs text-slate-400 font-medium tracking-wide">Đang tải dữ liệu...</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : filteredCategories.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-64 text-center">
                                        <div className="flex flex-col items-center gap-3 opacity-20">
                                            <Wallet className="h-12 w-12" />
                                            <p className="text-sm font-medium">Chưa có danh mục nào</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredCategories.map((item, index) => (
                                    <TableRow key={item.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors border-slate-50 dark:border-slate-800/50">
                                        <TableCell className="text-center text-xs text-slate-400 font-medium">
                                            {index + 1}
                                        </TableCell>
                                        <TableCell className="text-[13px] font-semibold text-slate-700 dark:text-slate-200">
                                            {item.type_name}
                                        </TableCell>
                                        <TableCell className="text-[13px] font-medium text-slate-600 dark:text-slate-400">
                                            {item.group_name}
                                        </TableCell>
                                        <TableCell>
                                            <span className={cn(
                                                "text-[10px] font-bold px-2.5 py-1 rounded-full",
                                                item.project_id ? "bg-blue-50 text-blue-600 dark:bg-blue-500/10" : "bg-slate-100 text-slate-500 dark:bg-slate-800"
                                            )}>
                                                {item.project_id ? (projects.find(p => p.project_id === item.project_id)?.project_name || item.project_id) : "Tất cả dự án"}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right whitespace-nowrap">
                                            <div className="flex items-center justify-end gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleOpenDialog(item)}
                                                    className="h-8 w-8 rounded-lg text-slate-400 hover:text-primary hover:bg-primary/5"
                                                >
                                                    <Edit2 className="h-3.5 w-3.5" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleDelete(item.id)}
                                                    className="h-8 w-8 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[500px] rounded-3xl p-0 overflow-hidden border-none shadow-2xl font-inter">
                    <DialogHeader className="p-8 pb-4 bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
                        <DialogTitle className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                            {editingCategory ? <Edit2 className="h-5 w-5 text-primary" /> : <Plus className="h-5 w-5 text-primary" />}
                            {editingCategory ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}
                        </DialogTitle>
                        <DialogDescription className="text-[13px] text-slate-500 mt-1">
                            {editingCategory ? 'Cập nhật thông tin phân loại chi phí.' : 'Tạo một loại chi phí và nhóm chi phí mới cho hệ thống.'}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="p-8 space-y-6">
                        <div className="grid gap-2">
                            <Label className="text-[11px] font-bold text-slate-500 ml-1 uppercase tracking-widest">Loại chi phí *</Label>
                            <Input
                                placeholder="VD: Chi phí vật tư, Chi phí nhân công..."
                                value={formData.type_name}
                                onChange={(e) => setFormData({ ...formData, type_name: e.target.value })}
                                className="h-11 rounded-xl border-slate-200 bg-white dark:bg-slate-950 shadow-sm focus:ring-primary/20 text-sm"
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label className="text-[11px] font-bold text-slate-500 ml-1 uppercase tracking-widest">Nhóm chi phí *</Label>
                            <Input
                                placeholder="VD: Thép xây dựng, Bê tông thương phẩm..."
                                value={formData.group_name}
                                onChange={(e) => setFormData({ ...formData, group_name: e.target.value })}
                                className="h-11 rounded-xl border-slate-200 bg-white dark:bg-slate-950 shadow-sm focus:ring-primary/20 text-sm"
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label className="text-[11px] font-bold text-slate-500 ml-1 uppercase tracking-widest">Dự án áp dụng</Label>
                            <Select
                                value={formData.project_id}
                                onValueChange={(val) => setFormData({ ...formData, project_id: val })}
                            >
                                <SelectTrigger className="h-11 rounded-xl border-slate-200 bg-white dark:bg-slate-950 shadow-sm text-sm">
                                    <SelectValue placeholder="Chọn dự án..." />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                                    <SelectItem value="all">Tất cả dự án</SelectItem>
                                    {projects.map(p => (
                                        <SelectItem key={p.project_id} value={p.project_id}>{p.project_name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <DialogFooter className="p-8 pt-4 bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 gap-2">
                        <Button
                            variant="ghost"
                            onClick={() => setIsDialogOpen(false)}
                            className="rounded-xl h-11 px-6 text-slate-500 hover:bg-slate-100 font-medium"
                        >
                            Hủy
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            disabled={isPending}
                            className="rounded-xl h-11 px-8 bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 font-bold tracking-tight"
                        >
                            {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            {editingCategory ? 'Lưu thay đổi' : 'Tạo danh mục'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
