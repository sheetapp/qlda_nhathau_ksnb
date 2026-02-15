'use client'

import { useState, useEffect } from 'react'
import {
    Plus,
    Search,
    MoreHorizontal,
    Pencil,
    Trash2,
    Calendar as CalendarIcon,
    DollarSign,
    CheckCircle2,
    Clock,
    Filter,
    Wallet,
    AlertCircle,
    Paperclip
} from 'lucide-react'
import { AttachmentList } from '@/components/shared/attachment-list'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
    getProjectInflows,
    addProjectInflow,
    updateProjectInflow,
    deleteProjectInflow
} from '@/lib/actions/projects'
import { toast } from 'sonner'

export function ProjectInflowTab({ projectId }: { projectId: string }) {
    const [inflows, setInflows] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingInflow, setEditingInflow] = useState<any>(null)
    const [displayAmount, setDisplayAmount] = useState('')
    const [formData, setFormData] = useState({
        amount: 0,
        date: new Date().toISOString().split('T')[0],
        description: '',
        type: 'Thanh toán đợt'
    })
    const [attachmentRecord, setAttachmentRecord] = useState<any>(null)

    useEffect(() => {
        loadInflows()
    }, [projectId])

    async function loadInflows() {
        try {
            setLoading(true)
            const data = await getProjectInflows(projectId)
            setInflows(data || [])
        } catch (error) {
            console.error('Error loading inflows:', error)
            toast.error('Không thể tải dữ liệu dòng thu')
        } finally {
            setLoading(false)
        }
    }

    const formatNumber = (num: number | string) => {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
    }

    const handleAmountChange = (val: string) => {
        const rawValue = val.replace(/,/g, '')
        if (!isNaN(Number(rawValue)) || rawValue === '') {
            const numValue = Number(rawValue)
            setFormData({ ...formData, amount: numValue })
            setDisplayAmount(formatNumber(rawValue))
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (formData.amount <= 0) {
            toast.warning('Vui lòng nhập số tiền hợp lệ')
            return
        }

        try {
            if (editingInflow) {
                await updateProjectInflow(editingInflow.id, projectId, formData)
                toast.success('Cập nhật thành công')
            } else {
                await addProjectInflow({ ...formData, project_id: projectId })
                toast.success('Thêm mới thành công')
            }
            setIsDialogOpen(false)
            setEditingInflow(null)
            setFormData({
                amount: 0,
                date: new Date().toISOString().split('T')[0],
                description: '',
                type: 'Thanh toán đợt'
            })
            setDisplayAmount('')
            loadInflows()
        } catch (error) {
            console.error('Error saving inflow:', error)
            toast.error('Có lỗi xảy ra khi lưu dữ liệu')
        }
    }

    const handleEdit = (inflow: any) => {
        setEditingInflow(inflow)
        const amount = Number(inflow.amount)
        setFormData({
            amount: amount,
            date: inflow.date,
            description: inflow.description || '',
            type: inflow.type || 'Thanh toán đợt'
        })
        setDisplayAmount(formatNumber(amount))
        setIsDialogOpen(true)
    }

    const handleDelete = async (id: string) => {
        try {
            await deleteProjectInflow(id, projectId)
            toast.success('Xóa thành công')
            loadInflows()
        } catch (error) {
            console.error('Error deleting inflow:', error)
            toast.error('Không thể xóa bản ghi')
        }
    }

    const filteredInflows = inflows.filter(inf =>
        inf.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inf.type?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const totalAmount = filteredInflows.reduce((sum, inf) => sum + Number(inf.amount), 0)

    return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden flex flex-col min-h-[500px]">
            {/* Inner Header */}
            <div className="p-8 border-b border-slate-100 dark:border-slate-800">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50 flex items-center gap-2">
                            Dòng Thu Dự án
                            <Badge variant="outline" className="rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 border-none font-medium">
                                {totalAmount.toLocaleString('vi-VN')} VND
                            </Badge>
                        </h2>
                        <p className="text-[13px] text-slate-500 mt-1">Quản lý các đợt tạm ứng và thanh toán từ Chủ đầu tư.</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="relative w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Tìm kiếm dòng thu..."
                                className="pl-10 h-10 rounded-xl border-slate-200/60 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 focus:ring-primary/20"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                            <DialogTrigger asChild>
                                <Button
                                    onClick={() => {
                                        setEditingInflow(null)
                                        setFormData({
                                            amount: 0,
                                            date: new Date().toISOString().split('T')[0],
                                            description: '',
                                            type: 'Thanh toán đợt'
                                        })
                                        setDisplayAmount('')
                                    }}
                                    className="h-10 rounded-xl shadow-sm px-5 bg-slate-900 dark:bg-slate-50 hover:bg-slate-800 dark:hover:bg-slate-200 transition-all font-medium flex items-center gap-2"
                                >
                                    <Plus className="h-4 w-4" />
                                    <span>Ghi nhận Thu</span>
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px] rounded-3xl border-slate-200 dark:border-slate-800">
                                <DialogHeader>
                                    <DialogTitle className="text-xl font-semibold">{editingInflow ? 'Cập nhật bản ghi' : 'Ghi nhận Dòng Thu'}</DialogTitle>
                                    <DialogDescription className="text-slate-500">
                                        Điền thông tin thanh toán nhận được từ Chủ đầu tư.
                                    </DialogDescription>
                                </DialogHeader>
                                <form onSubmit={handleSubmit} className="space-y-6 py-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="amount" className="text-[13px] font-semibold text-slate-700 dark:text-slate-300">Số tiền (VND)</Label>
                                        <div className="relative">
                                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                            <Input
                                                id="amount"
                                                placeholder="0"
                                                className="pl-10 h-12 rounded-xl focus:ring-primary/20 bg-slate-50/50"
                                                value={displayAmount}
                                                onChange={(e) => handleAmountChange(e.target.value)}
                                                required
                                            />
                                            {formData.amount > 0 && (
                                                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-primary bg-primary/5 px-2 py-0.5 rounded">
                                                    VND
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="date" className="text-[13px] font-semibold text-slate-700 dark:text-slate-300">Ngày nhận</Label>
                                            <Input
                                                id="date"
                                                type="date"
                                                className="h-12 rounded-xl focus:ring-primary/20"
                                                value={formData.date}
                                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="type" className="text-[13px] font-semibold text-slate-700 dark:text-slate-300">Loại</Label>
                                            <select
                                                id="type"
                                                className="w-full h-12 rounded-xl border border-slate-200 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-slate-800"
                                                value={formData.type}
                                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                            >
                                                <option value="Tạm ứng">Tạm ứng</option>
                                                <option value="Thanh toán đợt">Thanh toán đợt</option>
                                                <option value="Quyết toán">Quyết toán</option>
                                                <option value="Khác">Khác</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="description" className="text-[13px] font-semibold text-slate-700 dark:text-slate-300">Nội dung / Ghi chú</Label>
                                        <Input
                                            id="description"
                                            placeholder="Mô tả khoản thu..."
                                            className="h-12 rounded-xl focus:ring-primary/20"
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        />
                                    </div>
                                    <DialogFooter className="pt-4">
                                        <Button type="submit" className="w-full h-12 rounded-xl bg-primary text-white hover:bg-primary/90 transition-all font-semibold">
                                            {editingInflow ? 'Cập nhật' : 'Lưu bản ghi'}
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-x-auto">
                {loading ? (
                    <div className="flex items-center justify-center p-20">
                        <div className="flex flex-col items-center gap-3">
                            <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                            <p className="text-xs text-slate-400 font-medium tracking-wider ">Đang tải dữ liệu...</p>
                        </div>
                    </div>
                ) : filteredInflows.length > 0 ? (
                    <div className="min-w-full inline-block align-middle">
                        <table className="min-w-full border-separate border-spacing-0">
                            <thead>
                                <tr className="bg-slate-50/50 dark:bg-slate-800/20">
                                    <th className="px-8 py-4 text-left text-[11px] font-medium text-slate-400  tracking-[0.1em] border-b border-slate-100 dark:border-slate-800 pr-0">Ngày</th>
                                    <th className="px-8 py-4 text-left text-[11px] font-medium text-slate-400  tracking-[0.1em] border-b border-slate-100 dark:border-slate-800">Loại</th>
                                    <th className="px-8 py-4 text-left text-[11px] font-medium text-slate-400  tracking-[0.1em] border-b border-slate-100 dark:border-slate-800">Nội dung</th>
                                    <th className="px-8 py-4 text-right text-[11px] font-medium text-slate-400  tracking-[0.1em] border-b border-slate-100 dark:border-slate-800">Số tiền (VND)</th>
                                    <th className="px-8 py-4 text-center text-[11px] font-medium text-slate-400  tracking-[0.1em] border-b border-slate-100 dark:border-slate-800 w-10">Đính kèm</th>
                                    <th className="px-8 py-4 text-center text-[11px] font-medium text-slate-400  tracking-[0.1em] border-b border-slate-100 dark:border-slate-800 w-20"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                                {filteredInflows.map((inf) => (
                                    <tr key={inf.id} className="group hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-all duration-200">
                                        <td className="px-8 py-5 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
                                                    <CalendarIcon className="h-3.5 w-3.5 text-slate-500" />
                                                </div>
                                                <span className="text-[13px] font-medium text-slate-700 dark:text-slate-300">
                                                    {new Date(inf.date).toLocaleDateString('vi-VN')}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 whitespace-nowrap">
                                            <Badge variant="outline" className={cn(
                                                "rounded-lg border-none px-2.5 py-1 text-[11px] font-medium",
                                                inf.type === 'Tạm ứng' ? "bg-amber-50 dark:bg-amber-500/10 text-amber-600" :
                                                    inf.type === 'Quyết toán' ? "bg-blue-50 dark:bg-blue-500/10 text-blue-600" :
                                                        "bg-slate-100 dark:bg-slate-800 text-slate-500"
                                            )}>
                                                {inf.type}
                                            </Badge>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className="text-[13px] font-medium text-slate-900 dark:text-slate-100 line-clamp-1">
                                                {inf.description || 'Không có mô tả'}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 whitespace-nowrap text-right pr-12">
                                            <span className="text-[14px] font-medium text-slate-900 dark:text-slate-50">
                                                {Number(inf.amount).toLocaleString('vi-VN')}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 text-center">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-9 w-9 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-slate-400 hover:text-primary"
                                                onClick={() => setAttachmentRecord(inf)}
                                            >
                                                <Paperclip className="h-4 w-4" />
                                            </Button>
                                        </td>
                                        <td className="px-8 py-5 text-center">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0 rounded-lg group-hover:bg-white dark:group-hover:bg-slate-700 shadow-none transition-all">
                                                        <MoreHorizontal className="h-4 w-4 text-slate-400" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="rounded-2xl border-slate-200 dark:border-slate-800 shadow-xl">
                                                    <DropdownMenuLabel className="text-[11px] font-medium uppercase tracking-wider text-slate-400 p-3">Thao tác</DropdownMenuLabel>
                                                    <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-800" />
                                                    <DropdownMenuItem onClick={() => handleEdit(inf)} className="p-3 cursor-pointer rounded-xl flex items-center gap-2.5 text-slate-600 dark:text-slate-400">
                                                        <Pencil className="h-4 w-4" />
                                                        <span className="text-[13px] font-medium">Chỉnh sửa</span>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => {
                                                            if (confirm('Bạn có chắc chắn muốn xóa bản ghi này?')) {
                                                                handleDelete(inf.id)
                                                            }
                                                        }}
                                                        className="p-3 cursor-pointer rounded-xl flex items-center gap-2.5 text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                        <span className="text-[13px] font-medium">Xóa bản ghi</span>
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                        <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-full mb-6 relative">
                            <Wallet className="h-10 w-10 text-slate-200 dark:text-slate-700" />
                            <div className="absolute inset-0 bg-primary/5 rounded-full animate-ping" />
                        </div>
                        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">Chưa có dữ liệu dòng thu</h3>
                        <p className="text-[13px] text-slate-500 max-w-[300px] mt-2 mb-8">
                            Bắt đầu ghi nhận các đợt thanh toán từ Chủ đầu tư để theo dõi dòng tiền dự án.
                        </p>
                        <Button
                            onClick={() => setIsDialogOpen(true)}
                            className="rounded-2xl h-12 px-8 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:shadow-lg transition-all"
                        >
                            Thêm khoản thu đầu tiên
                        </Button>
                    </div>
                )}
            </div>

            {/* Inner Footer */}
            <div className="p-6 bg-slate-50/50 dark:bg-slate-800/20 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center px-10">
                <div className="flex items-center gap-4">
                    <div className="flex -space-x-2">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center border-2 border-white dark:border-slate-900 shadow-sm">
                            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        </div>
                        <div className="w-8 h-8 rounded-full bg-slate-200/50 dark:bg-slate-800 flex items-center justify-center border-2 border-white dark:border-slate-900 shadow-sm">
                            <Clock className="h-4 w-4 text-primary/70" />
                        </div>
                    </div>
                    <p className="text-[11px] font-medium text-slate-400 uppercase tracking-widest">Dữ liệu thời gian thực</p>
                </div>
                <p className="text-[11px] font-medium text-slate-400 italic">Cập nhật lần cuối: {new Date().toLocaleTimeString('vi-VN')}</p>
            </div>

            {/* Attachments Dialog */}
            <Dialog open={!!attachmentRecord} onOpenChange={(open) => !open && setAttachmentRecord(null)}>
                <DialogContent className="sm:max-w-[550px] rounded-3xl p-0 overflow-hidden border-none shadow-2xl">
                    <div className="p-8 pb-4">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-bold tracking-tight text-slate-900">
                                Tài liệu: {attachmentRecord?.type}
                            </DialogTitle>
                            <DialogDescription className="text-[13px] text-slate-500">
                                {attachmentRecord?.description || 'Quản lý các tệp tin đính kèm cho nghiệp vụ thu này.'}
                            </DialogDescription>
                        </DialogHeader>
                    </div>

                    <div className="px-8 pb-8 pt-4">
                        {attachmentRecord && (
                            <AttachmentList
                                tableName="project_inflows"
                                refId={attachmentRecord.id}
                                title="Danh sách đính kèm"
                            />
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
