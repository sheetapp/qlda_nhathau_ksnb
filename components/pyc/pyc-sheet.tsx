'use client'

import { useEffect, useState, useCallback, useRef, Fragment } from 'react'
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    Dialog,
    DialogContent,
} from '@/components/ui/dialog'
import { createPYC, updatePYC, getNextPYCSequence } from '@/lib/actions/pyc'
import { getTasksByCategory } from '@/lib/actions/tasks'
import { getAllResources } from '@/lib/actions/resources'
import { Plus, Trash2, Package, Calculator, Info, ChevronRight, ChevronLeft, ChevronDown, Save, FileText, Loader2, UserPlus, Printer } from 'lucide-react'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { LOAI_PHIEU, MUC_DO_UU_TIEN, DEFAULT_LOAI_PHIEU, DEFAULT_MUC_DO_UU_TIEN, VAT_OPTIONS, DEFAULT_VAT_OPTION, TRANG_THAI_PHIEU, DEFAULT_TRANG_THAI_PHIEU, TASK_CATEGORIES } from '@/Config/thongso'
import { ResourceCombobox } from './resource-combobox'
import { ResourceDialog } from '@/components/resources/resource-dialog'
import { getAllPersonnel } from '@/lib/actions/personnel'
import { resourceStore } from '@/lib/resource-store'
import { cn } from '@/lib/utils'

interface PYCDetail {
    id?: string
    item_name: string
    custom_item_name?: string | null
    category?: string | null
    task_description?: string | null
    material_code?: string | null
    unit?: string | null
    quantity: number | string
    unit_price: number | string
    vat_display?: string | null
    vat_value?: number | string | null
    muc_dich_sd?: string | null
    notes?: string | null
}

interface PYC {
    request_id: string
    title: string
    request_type: string | null
    status: string | null
    priority: string | null
    project_id: string | null
    task_category?: string | null
    muc_dich_sd?: string | null
    notes: string | null
    vat_display?: string | null
    vat_value?: number | string | null
    pyc_detail?: PYCDetail[]
    attachments?: { name: string; description: string; url: string }[] | null
}

interface PYCSheetProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    pyc: PYC | null
    projects: { project_id: string; project_name: string }[]
    projectId?: string
    onSuccess: () => void
}

interface Task {
    task_id: string
    task_name: string
    task_category: string
    description?: string | null
}

interface Resource {
    resource_id: string
    resource_name: string
    unit: string | null
    unit_price: number | null
}

export function PYCSheet({
    open,
    onOpenChange,
    pyc,
    projects,
    projectId,
    onSuccess,
}: PYCSheetProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [currentStep, setCurrentStep] = useState(1)

    // Resize logic
    const [sheetWidth, setSheetWidth] = useState(1200)
    const isResizing = useRef(false)

    // Set a reasonable initial width based on screen size on mount
    useEffect(() => {
        const defaultWidth = Math.min(1200, window.innerWidth * 0.95);
        setSheetWidth(defaultWidth);
    }, []);

    const startResizing = useCallback((e: React.MouseEvent) => {
        isResizing.current = true
        document.addEventListener('mousemove', handleMouseMove)
        document.addEventListener('mouseup', stopResizing)
        document.body.style.cursor = 'ew-resize'
        document.body.style.userSelect = 'none'
    }, [])

    const stopResizing = useCallback(() => {
        isResizing.current = false
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', stopResizing)
        document.body.style.cursor = 'default'
        document.body.style.userSelect = 'auto'
    }, [])

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!isResizing.current) return
        const newWidth = window.innerWidth - e.clientX
        if (newWidth > 400 && newWidth < window.innerWidth * 0.95) {
            setSheetWidth(newWidth)
        }
    }, [])

    const [headerData, setHeaderData] = useState({
        request_id: '',
        title: '',
        request_type: DEFAULT_LOAI_PHIEU,
        status: DEFAULT_TRANG_THAI_PHIEU,
        priority: DEFAULT_MUC_DO_UU_TIEN,
        project_id: '',
        task_category: '',
        muc_dich_sd: '',
        notes: '',
        vat_display: DEFAULT_VAT_OPTION.display,
        vat_value: DEFAULT_VAT_OPTION.value,
        attachments: [] as { name: string; description: string; url: string }[],
    })

    const [details, setDetails] = useState<PYCDetail[]>([])
    const [selectedDetailIndex, setSelectedDetailIndex] = useState<number>(-1)
    const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)

    // Resource Creation Dialog state
    const [isResourceDialogOpen, setIsResourceDialogOpen] = useState(false)
    const [allUsers, setAllUsers] = useState<{ email: string; full_name: string }[]>([])
    const [resourceDataIndex, setResourceDataIndex] = useState<number | null>(null)

    // Data for dropdowns
    const [tasksByCategory, setTasksByCategory] = useState<Record<string, Task[]>>({})
    const [loadingTasks, setLoadingTasks] = useState<Record<number, boolean>>({})

    // Load initial data on mount
    useEffect(() => {
        const loadInitialData = async () => {
            try {
                // Load personnel for resource dialog
                const personnelData = await getAllPersonnel()
                setAllUsers(personnelData.map(p => ({
                    email: p.email,
                    full_name: p.full_name
                })))
            } catch (error) {
                console.error('Error loading initial data:', error)
            }
        }

        if (open) {
            loadInitialData()
            setCurrentStep(1) // Reset step on open
        }
    }, [open])

    // Generate Request ID logic
    const generateRequestId = useCallback(async (projId: string) => {
        if (!projId || projId === 'global') {
            setHeaderData(prev => ({ ...prev, request_id: `PYC/GENERAL/${new Date().getFullYear()}/${String(new Date().getMonth() + 1).padStart(2, '0')}/0001` }))
            return
        }

        try {
            const now = new Date()
            const year = now.getFullYear()
            const month = now.getMonth() + 1
            const nextSeq = await getNextPYCSequence(projId, year, month)
            const formattedSeq = String(nextSeq).padStart(4, '0')
            const newId = `PYC/${projId}/${year}/${String(month).padStart(2, '0')}/${formattedSeq}`
            setHeaderData(prev => ({ ...prev, request_id: newId }))
        } catch (error) {
            console.error('Error generating request ID:', error)
        }
    }, [])

    useEffect(() => {
        if (pyc) {
            setHeaderData({
                request_id: pyc.request_id,
                title: pyc.title,
                request_type: (pyc.request_type || DEFAULT_LOAI_PHIEU) as any,
                status: (pyc.status || DEFAULT_TRANG_THAI_PHIEU) as any,
                priority: (pyc.priority || DEFAULT_MUC_DO_UU_TIEN) as any,
                project_id: pyc.project_id || '',
                task_category: pyc.task_category || '',
                muc_dich_sd: (pyc as any).muc_dich_sd || '',
                notes: pyc.notes || '',
                vat_display: (pyc.vat_display || DEFAULT_VAT_OPTION.display) as any,
                vat_value: (pyc.vat_value !== undefined ? Number(pyc.vat_value) : DEFAULT_VAT_OPTION.value) as any,
                attachments: (pyc.attachments || []).map((att: any) => typeof att === 'string' ? JSON.parse(att) : att),
            })
            setDetails(pyc.pyc_detail ? pyc.pyc_detail.map(d => ({
                ...d,
                quantity: Number(d.quantity || 0),
                unit_price: Number(d.unit_price || 0),
                vat_display: d.vat_display || DEFAULT_VAT_OPTION.display,
                vat_value: d.vat_value !== undefined ? Number(d.vat_value) : DEFAULT_VAT_OPTION.value
            })) : [])
        } else {
            // Initial ID for no project
            const initialId = `PYC/GENERAL/${new Date().getFullYear()}/${String(new Date().getMonth() + 1).padStart(2, '0')}/0001`
            setHeaderData({
                request_id: initialId,
                title: '',
                request_type: DEFAULT_LOAI_PHIEU,
                status: DEFAULT_TRANG_THAI_PHIEU,
                priority: DEFAULT_MUC_DO_UU_TIEN,
                project_id: projectId || '',
                task_category: '',
                muc_dich_sd: '',
                notes: '',
                vat_display: DEFAULT_VAT_OPTION.display,
                vat_value: DEFAULT_VAT_OPTION.value,
                attachments: [],
            })
            setDetails([])

            if (projectId) {
                generateRequestId(projectId)
            }
        }
    }, [pyc, open, projectId, generateRequestId])

    const handleAddDetail = () => {
        const newDetail: PYCDetail = {
            item_name: '',
            quantity: 1,
            unit_price: 0,
            unit: '',
            category: headerData.task_category || '',
            task_description: '',
            material_code: '',
            vat_display: headerData.vat_display,
            vat_value: headerData.vat_value,
            muc_dich_sd: headerData.muc_dich_sd || ''
        }

        const newDetails = [...details, newDetail]
        const newIndex = newDetails.length - 1
        setDetails(newDetails)
        setSelectedDetailIndex(newIndex)
        setIsDetailDialogOpen(true)

        // If a category is defaulted, trigger task loading for that category
        if (newDetail.category) {
            handleCategoryChange(newIndex, newDetail.category)
        }
    }

    const handleRemoveDetail = (index: number) => {
        const newDetails = details.filter((_, i) => i !== index)
        setDetails(newDetails)
        if (selectedDetailIndex >= newDetails.length) {
            setSelectedDetailIndex(Math.max(0, newDetails.length - 1))
        }
    }

    const handleDetailChange = (index: number, field: keyof PYCDetail, value: any) => {
        setDetails(prev => {
            const newDetails = [...prev]
            newDetails[index] = { ...newDetails[index], [field]: value }
            return newDetails
        })
    }

    const handleOpenResourceDialog = (index: number) => {
        setResourceDataIndex(index)
        setIsResourceDialogOpen(true)
    }

    const handleResourceDialogSuccess = async () => {
        try {
            // Force refresh the shared store
            const updatedResources = await resourceStore.refresh()

            // If we have a target row, auto-select the latest created resource
            if (resourceDataIndex !== null && updatedResources.length > 0) {
                // Find resource with newest ID (RES-timestamp format)
                const latestResource = [...updatedResources].sort((a, b) => b.resource_id.localeCompare(a.resource_id))[0]

                if (latestResource) {
                    handleDetailChange(resourceDataIndex, 'item_name', latestResource.resource_name)
                    handleDetailChange(resourceDataIndex, 'unit', latestResource.unit)
                    handleDetailChange(resourceDataIndex, 'unit_price', latestResource.unit_price)
                    handleDetailChange(resourceDataIndex, 'material_code', latestResource.resource_id)
                }
            }
        } catch (error) {
            console.error('Error refreshing resources after creation:', error)
        } finally {
            setIsResourceDialogOpen(false)
            setResourceDataIndex(null)
        }
    }

    // Handle category change - load tasks for that category
    const handleCategoryChange = async (index: number, category: string) => {
        // Use a single state update to avoid race conditions
        setDetails(prev => {
            const newDetails = [...prev]
            newDetails[index] = {
                ...newDetails[index],
                category: category,
                task_description: '' // Clear task_description when category changes
            }
            return newDetails
        })

        // Load tasks for this category if not already loaded
        if (category && !tasksByCategory[category]) {
            setLoadingTasks(prev => ({ ...prev, [index]: true }))
            try {
                const tasks = await getTasksByCategory(category)
                setTasksByCategory(prev => ({ ...prev, [category]: tasks as Task[] }))
            } catch (error) {
                console.error('Error loading tasks:', error)
            } finally {
                setLoadingTasks(prev => ({ ...prev, [index]: false }))
            }
        }
    }

    // Handle material code selection - auto-fill resource details
    const handleMaterialCodeSelect = (index: number, resource: Resource) => {
        handleDetailChange(index, 'material_code', resource.resource_id)
        handleDetailChange(index, 'item_name', resource.resource_name)
        handleDetailChange(index, 'unit', resource.unit || '')
        handleDetailChange(index, 'unit_price', resource.unit_price || 0)
    }

    const calculateTotal = () => {
        return details.reduce((sum, item) => {
            const beforeTax = Number(item.quantity || 0) * Number(item.unit_price || 0)
            const vat = 1 + (Number(item.vat_value || 0) / 100)
            return sum + (beforeTax * vat)
        }, 0)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (details.length === 0 || details.some(d => !d.item_name)) {
            alert('Vui lòng nhập tên cho ít nhất một hạng mục.')
            return
        }
        setIsLoading(true)

        try {
            if (pyc) {
                await updatePYC(pyc.request_id, headerData, details)
            } else {
                await createPYC(headerData, details)
            }
            onSuccess()
            onOpenChange(false)
        } catch (error) {
            console.error('Error saving PYC:', error)
            alert('Có lỗi xảy ra khi lưu phiếu yêu cầu.')
        } finally {
            setIsLoading(false)
        }
    }

    const nextStep = () => {
        if (currentStep === 1) {
            if (!headerData.title) {
                alert("Vui lòng nhập tiêu đề phiếu.")
                return
            }
        }
        setCurrentStep(prev => prev + 1)
    }

    const formatNumber = (val: number | string | null | undefined) => {
        if (val === null || val === undefined || val === '') return ''
        const num = Number(val)
        if (isNaN(num)) return ''
        return new Intl.NumberFormat('vi-VN').format(num)
    }

    const parseFormattedNumber = (val: string) => {
        return val.replace(/\./g, '').replace(/,/g, '.')
    }

    const formatCurrency = (val: number | string | null | undefined) => {
        if (val === null || val === undefined || val === '') return '0'
        return new Intl.NumberFormat('vi-VN').format(Number(val))
    }

    const prevStep = () => {
        setCurrentStep(prev => prev - 1)
    }

    const SectionTitle = ({ icon: Icon, title }: { icon: any, title: string }) => (
        <div className="flex items-center gap-2 text-primary font-medium text-[11px] tracking-wide mb-2.5 mt-4 first:mt-0 opacity-80">
            <Icon className="h-3.5 w-3.5" />
            {title}
        </div>
    )

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent
                side="right"
                className="overflow-hidden p-0 border-none shadow-2xl flex flex-col"
                style={{ maxWidth: 'none', width: `${sheetWidth}px` }}
            >
                {/* Resize handle */}
                <div
                    onMouseDown={startResizing}
                    className="absolute left-0 top-0 w-1.5 h-full cursor-ew-resize hover:bg-primary/20 transition-colors z-50 flex items-center justify-center group"
                >
                    <div className="h-8 w-1 rounded-full bg-border group-hover:bg-primary/40" />
                </div>

                {/* Header Section */}
                <div className="bg-primary/5 px-4 py-3 border-b border-primary/10 sticky top-0 z-10 backdrop-blur-xl shrink-0">
                    <SheetHeader className="flex flex-row items-center gap-3 space-y-0 text-left">
                        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shadow-inner">
                            <FileText className="h-6 w-6" />
                        </div>
                        <div className="flex-1">
                            <SheetTitle className="text-lg font-bold tracking-tight">
                                {pyc ? 'Cập nhật Phiếu yêu cầu' : 'Lập Phiếu yêu cầu mới'}
                            </SheetTitle>
                            <div className="flex items-center gap-3 mt-1">
                                <div
                                    onClick={() => setCurrentStep(1)}
                                    className={cn(
                                        "flex items-center gap-1.5 cursor-pointer transition-all",
                                        currentStep === 1 ? "text-primary font-medium" : "text-muted-foreground hover:text-foreground"
                                    )}
                                >
                                    <span className={cn(
                                        "h-4 w-4 rounded-full flex items-center justify-center text-[9px] font-medium shadow-sm shrink-0",
                                        currentStep === 1 ? "bg-primary text-primary-foreground" : "bg-muted-foreground/20 text-muted-foreground"
                                    )}>1</span>
                                    <span className="text-[11px]">THÔNG TIN CHUNG</span>
                                </div>
                                <ChevronRight className="h-3 w-3 text-muted-foreground/20" />
                                <div
                                    onClick={() => {
                                        if (headerData.title) setCurrentStep(2)
                                        else alert("Vui lòng nhập tiêu đề phiếu trước khi qua Bước 2.")
                                    }}
                                    className={cn(
                                        "flex items-center gap-1.5 cursor-pointer transition-all",
                                        currentStep === 2 ? "text-primary font-medium" : "text-muted-foreground hover:text-foreground"
                                    )}
                                >
                                    <span className={cn(
                                        "h-4 w-4 rounded-full flex items-center justify-center text-[9px] font-medium shadow-sm shrink-0",
                                        currentStep === 2 ? "bg-primary text-primary-foreground" : "bg-muted-foreground/20 text-muted-foreground"
                                    )}>2</span>
                                    <span className="text-[11px]">CHI TIẾT PHIẾU</span>
                                </div>
                            </div>
                        </div>
                    </SheetHeader>
                </div>

                {/* Content Section */}
                <div className="flex-1 overflow-y-auto px-4 md:px-5 py-3 pt-1.5 bg-muted/5">
                    {currentStep === 1 && (
                        <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
                            {/* Card 1: Thông tin cơ bản */}
                            <div className="bg-card border border-border/50 rounded-2xl px-5 py-4 shadow-sm">
                                <SectionTitle icon={Info} title="Thông tin cơ bản" />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                                    <div className="space-y-1.5">
                                        <Label className="text-[12px] font-medium text-slate-600">Dự án</Label>
                                        <Select
                                            value={headerData.project_id || "global"}
                                            onValueChange={v => {
                                                const projId = v === "global" ? "" : v
                                                setHeaderData({ ...headerData, project_id: projId })
                                                if (!pyc) generateRequestId(projId)
                                            }}
                                        >
                                            <SelectTrigger className="rounded-xl h-10 border-border/40 bg-card/40 text-[13px] w-full">
                                                <SelectValue placeholder="Chọn dự án" />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-xl">
                                                <SelectItem value="global" className="text-[13px]">Dùng chung (Toàn bộ)</SelectItem>
                                                {projects.map(p => (
                                                    <SelectItem key={p.project_id} value={p.project_id} className="text-[13px]">{p.project_name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label className="text-[12px] font-medium text-slate-600">Mã phiếu</Label>
                                        <Input
                                            value={headerData.request_id}
                                            readOnly
                                            className="rounded-xl h-10 bg-muted/50 font-mono text-[13px] border-dashed text-primary/70"
                                        />
                                    </div>

                                    <div className="space-y-1.5 md:col-span-2">
                                        <Label className="text-[12px] font-medium text-slate-600">Tiêu đề phiếu <span className="text-destructive font-normal">*</span></Label>
                                        <Input
                                            value={headerData.title}
                                            onChange={e => setHeaderData({ ...headerData, title: e.target.value })}
                                            placeholder="VD: Yêu cầu vật tư thi công tầng 5..."
                                            className="rounded-xl h-10 border-border/40 bg-card/40 text-[13px]"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label className="text-[12px] font-medium text-slate-600">Loại yêu cầu</Label>
                                        <Select value={headerData.request_type as any} onValueChange={v => setHeaderData({ ...headerData, request_type: v as any })}>
                                            <SelectTrigger className="rounded-xl h-10 border-border/40 bg-card/40 text-[13px] w-full">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-xl">
                                                {LOAI_PHIEU.map(t => (
                                                    <SelectItem key={t} value={t} className="text-[13px]">{t}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label className="text-[12px] font-medium text-slate-600">Độ ưu tiên</Label>
                                        <Select value={headerData.priority as any} onValueChange={v => setHeaderData({ ...headerData, priority: v as any })}>
                                            <SelectTrigger className="rounded-xl h-10 border-border/40 bg-card/40 text-[13px] w-full">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-xl">
                                                {MUC_DO_UU_TIEN.map(p => (
                                                    <SelectItem key={p} value={p} className="text-[13px]">{p}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label className="text-[12px] font-medium text-slate-600">VAT mặc định</Label>
                                        <Select
                                            value={headerData.vat_display || DEFAULT_VAT_OPTION.display}
                                            onValueChange={v => {
                                                const selectedVAT = VAT_OPTIONS.find(opt => opt.display === v)
                                                if (selectedVAT) {
                                                    setHeaderData({
                                                        ...headerData,
                                                        vat_display: selectedVAT.display,
                                                        vat_value: selectedVAT.value as any
                                                    })
                                                }
                                            }}
                                        >
                                            <SelectTrigger className="rounded-xl h-10 border-border/40 bg-card/40 text-[13px] w-full">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-xl">
                                                {VAT_OPTIONS.map(opt => (
                                                    <SelectItem key={opt.display} value={opt.display} className="text-[13px]">{opt.display}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label className="text-[12px] font-medium text-slate-600">Hạng mục công việc chính</Label>
                                        <Select
                                            value={headerData.task_category}
                                            onValueChange={v => setHeaderData({ ...headerData, task_category: v })}
                                        >
                                            <SelectTrigger className="rounded-xl h-10 border-border/40 bg-card/40 text-[13px] w-full">
                                                <SelectValue placeholder="Chọn hạng mục chính..." />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-xl">
                                                {TASK_CATEGORIES.map(cat => (
                                                    <SelectItem key={cat} value={cat} className="text-[13px]">{cat}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-1.5 md:col-span-2">
                                        <Label className="text-[12px] font-medium text-slate-600">Mục đích sử dụng</Label>
                                        <Input
                                            value={headerData.muc_dich_sd}
                                            onChange={e => setHeaderData({ ...headerData, muc_dich_sd: e.target.value })}
                                            placeholder="VD: Phục vụ thi công kết cấu hầm..."
                                            className="rounded-xl h-10 border-border/40 bg-card/40 text-[13px]"
                                        />
                                    </div>

                                    <div className="space-y-1.5 md:col-span-2">
                                        <Label className="text-[12px] font-medium text-slate-600">Ghi chú & Lưu ý</Label>
                                        <Textarea
                                            value={headerData.notes || ''}
                                            onChange={e => setHeaderData({ ...headerData, notes: e.target.value })}
                                            placeholder="Lý do yêu cầu chi tiết hoặc các lưu ý đặc biệt..."
                                            className="min-h-[80px] rounded-xl border-border/40 bg-card/40 resize-none text-[13px]"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Card 2: Tài liệu đính kèm */}
                            <div className="bg-card border border-border/50 rounded-2xl p-5 shadow-sm md:col-span-2">
                                <div className="flex items-center justify-between mb-1">
                                    <SectionTitle icon={FileText} title="Tài liệu đính kèm" />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setHeaderData({
                                            ...headerData,
                                            attachments: [...(headerData.attachments || []), { name: '', description: '', url: '' }]
                                        })}
                                        className="h-8 rounded-lg border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 text-[11px]"
                                    >
                                        <Plus className="h-3 w-3 mr-1.5" />
                                        Thêm tài liệu
                                    </Button>
                                </div>
                                <div className="text-[11px] text-muted-foreground italic mb-4 opacity-70">
                                    (Đính kèm các tài liệu làm rõ yêu cầu mua sắm này như phiếu đề xuất.v.v.)
                                </div>

                                <div className="space-y-3">
                                    {(headerData.attachments || []).map((att, idx) => (
                                        <div key={idx} className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 rounded-xl border border-border/40 bg-card/20 relative group">
                                            <div className="space-y-1">
                                                <Label className="text-[10px] font-medium text-muted-foreground uppercase opacity-70">Tên tài liệu</Label>
                                                <Input
                                                    value={att.name}
                                                    onChange={e => {
                                                        const newAtts = [...(headerData.attachments || [])]
                                                        newAtts[idx].name = e.target.value
                                                        setHeaderData({ ...headerData, attachments: newAtts })
                                                    }}
                                                    placeholder="VD: Bản vẽ kỹ thuật..."
                                                    className="h-8 rounded-lg border-border/40 bg-background/50 text-[12px]"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <Label className="text-[10px] font-medium text-muted-foreground uppercase opacity-70">Mô tả</Label>
                                                <Input
                                                    value={att.description}
                                                    onChange={e => {
                                                        const newAtts = [...(headerData.attachments || [])]
                                                        newAtts[idx].description = e.target.value
                                                        setHeaderData({ ...headerData, attachments: newAtts })
                                                    }}
                                                    placeholder="Mô tả nội dung..."
                                                    className="h-8 rounded-lg border-border/40 bg-background/50 text-[12px]"
                                                />
                                            </div>
                                            <div className="space-y-1 relative pr-8">
                                                <Label className="text-[10px] font-medium text-muted-foreground uppercase opacity-70">Link đính kèm</Label>
                                                <Input
                                                    value={att.url}
                                                    onChange={e => {
                                                        const newAtts = [...(headerData.attachments || [])]
                                                        newAtts[idx].url = e.target.value
                                                        setHeaderData({ ...headerData, attachments: newAtts })
                                                    }}
                                                    placeholder="https://..."
                                                    className="h-8 rounded-lg border-border/40 bg-background/50 text-[12px]"
                                                />
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => {
                                                        const newAtts = (headerData.attachments || []).filter((_, i) => i !== idx)
                                                        setHeaderData({ ...headerData, attachments: newAtts })
                                                    }}
                                                    className="absolute right-0 bottom-0 h-8 w-8 text-muted-foreground hover:text-destructive opacity-40 hover:opacity-100 transition-opacity"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                    {(headerData.attachments || []).length === 0 && (
                                        <div className="text-center py-4 border border-dashed border-border/60 rounded-xl bg-card/10 text-muted-foreground text-[11px] italic">
                                            Chưa có tài liệu đính kèm. Nhấp vào "Thêm tài liệu" để bắt đầu.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {currentStep === 2 && (
                        <div className="space-y-5 animate-in slide-in-from-right-4 duration-300">
                            <div className="bg-card border border-border/50 rounded-2xl p-5 shadow-sm overflow-hidden flex flex-col">
                                <div className="flex items-center justify-between mb-4 shrink-0">
                                    <SectionTitle icon={Package} title="Chi tiết danh mục yêu cầu" />
                                    <Button type="button" variant="outline" size="sm" onClick={handleAddDetail} className="h-8 rounded-lg border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 px-3 text-[11px]">
                                        <Plus className="h-3.5 w-3.5 mr-1.5" />
                                        Thêm dòng mới
                                    </Button>
                                </div>

                                <div className="space-y-5">
                                    <div className="border border-border/40 bg-card overflow-hidden shadow-sm">
                                        <Table>
                                            <TableHeader className="bg-[#1a472a]">
                                                <TableRow className="hover:bg-transparent border-none">
                                                    <TableHead className="w-[50px] text-center text-[12px] font-semibold text-white/90 py-3 uppercase tracking-tight">STT</TableHead>
                                                    <TableHead className="min-w-[200px] text-[12px] font-semibold text-white/90 py-3 flex items-center gap-1.5">
                                                        Tên vật tư quy cách
                                                        <ChevronDown className="h-3 w-3 opacity-50" />
                                                    </TableHead>
                                                    <TableHead className="w-[80px] text-center text-[12px] font-semibold text-white/90 py-3 uppercase tracking-tight">
                                                        <div className="flex items-center justify-center gap-1">
                                                            ĐVT
                                                            <ChevronDown className="h-3 w-3 opacity-30" />
                                                        </div>
                                                    </TableHead>
                                                    <TableHead className="w-[100px] text-right text-[12px] font-semibold text-white/90 py-3 uppercase tracking-tight">
                                                        <div className="flex items-center justify-end gap-1">
                                                            Số lượng
                                                            <ChevronDown className="h-3 w-3 opacity-30" />
                                                        </div>
                                                    </TableHead>
                                                    <TableHead className="w-[140px] text-right text-[12px] font-semibold text-white/90 py-3 uppercase tracking-tight">
                                                        <div className="flex items-center justify-end gap-1">
                                                            Đơn giá trước thuế
                                                            <ChevronDown className="h-3 w-3 opacity-30" />
                                                        </div>
                                                    </TableHead>
                                                    <TableHead className="w-[90px] text-center text-[12px] font-semibold text-white/90 py-3 flex items-center justify-center gap-1.5 uppercase tracking-tight">
                                                        <Info className="h-3 w-3 opacity-50" />
                                                        VAT
                                                        <ChevronDown className="h-3 w-3 opacity-30" />
                                                    </TableHead>
                                                    <TableHead className="w-[160px] text-right text-[12px] font-semibold text-white/90 py-3 uppercase tracking-tight">
                                                        <div className="flex items-center justify-end gap-1">
                                                            Thành tiền sau thuế
                                                            <ChevronDown className="h-3 w-3 opacity-30" />
                                                        </div>
                                                    </TableHead>
                                                    <TableHead className="w-[40px]"></TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {details.map((detail, index) => (
                                                    <TableRow
                                                        key={index}
                                                        className={cn(
                                                            "group transition-all duration-200 border-border/20 cursor-pointer",
                                                            selectedDetailIndex === index ? "bg-primary/[0.04] border-l-2 border-l-primary" : "hover:bg-primary/[0.01]"
                                                        )}
                                                        onClick={() => {
                                                            setSelectedDetailIndex(index)
                                                            setIsDetailDialogOpen(true)
                                                        }}
                                                    >
                                                        <TableCell className="p-2.5 text-center align-middle text-[12px] text-slate-500 border-r border-border/30">
                                                            {index + 1}
                                                        </TableCell>

                                                        <TableCell className="p-2.5 align-middle border-r border-border/30">
                                                            <div className="flex flex-col gap-0.5">
                                                                <span className="text-[13px] font-medium text-slate-800 leading-tight">
                                                                    {detail.custom_item_name || detail.item_name}
                                                                </span>
                                                                {detail.notes && (
                                                                    <span className="text-[11px] text-slate-400 italic font-light truncate max-w-[250px]">
                                                                        {detail.notes}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </TableCell>

                                                        <TableCell className="p-2.5 align-middle text-center border-r border-border/30 text-[13px] text-slate-600">
                                                            {detail.unit || '---'}
                                                        </TableCell>

                                                        <TableCell className="p-2.5 align-middle text-right border-r border-border/30 font-medium text-[13px] text-slate-700 tabular-nums">
                                                            {formatNumber(detail.quantity)}
                                                        </TableCell>

                                                        <TableCell className="p-2.5 align-middle text-right border-r border-border/30 text-[13px] text-slate-600 tabular-nums">
                                                            {formatNumber(detail.unit_price)}
                                                        </TableCell>

                                                        <TableCell className="p-2.5 align-middle text-center border-r border-border/30">
                                                            <div className={cn(
                                                                "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold tracking-tight",
                                                                Number(detail.vat_value) === 10 ? "bg-emerald-100 text-emerald-700" :
                                                                    Number(detail.vat_value) === 5 ? "bg-amber-100 text-amber-700" :
                                                                        "bg-slate-100 text-slate-600"
                                                            )}>
                                                                {detail.vat_display || '0%'}
                                                            </div>
                                                        </TableCell>

                                                        <TableCell className="p-2.5 text-right align-middle border-r border-border/30">
                                                            <span className="text-[13px] font-bold text-slate-900 tabular-nums">
                                                                {formatCurrency(
                                                                    Number(detail.quantity || 0) *
                                                                    Number(detail.unit_price || 0) *
                                                                    (1 + (Number(detail.vat_value || 0) / 100))
                                                                )}
                                                            </span>
                                                        </TableCell>

                                                        <TableCell className="p-1 text-center align-middle">
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={(e) => {
                                                                    e.stopPropagation()
                                                                    handleRemoveDetail(index)
                                                                }}
                                                                className="h-8 w-8 text-muted-foreground/30 hover:text-destructive hover:bg-destructive/5 opacity-0 group-hover:opacity-100 transition-all"
                                                            >
                                                                <Trash2 className="h-3.5 w-3.5" />
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Section */}
                <div className="px-5 py-4 border-t bg-background sticky bottom-0 z-10 flex items-center justify-between shadow-[0_-10px_40px_rgba(0,0,0,0.03)] shrink-0">
                    <Button
                        variant="ghost"
                        onClick={currentStep === 1 ? () => onOpenChange(false) : prevStep}
                        disabled={isLoading}
                        className="rounded-xl px-5 h-10 font-medium hover:bg-muted text-[13px]"
                    >
                        {currentStep === 1 ? 'Thoát' : (
                            <>
                                <ChevronLeft className="mr-1.5 h-4 w-4" />
                                Quay lại
                            </>
                        )}
                    </Button>

                    <div className="flex items-center gap-6">
                        {currentStep === 2 && (
                            <div className="flex items-center gap-2 text-muted-foreground/60">
                                <span className="text-[11px] font-medium uppercase tracking-wider">Tổng cộng:</span>
                                <span className="text-lg font-bold text-primary tabular-nums">
                                    {new Intl.NumberFormat('vi-VN').format(calculateTotal())}
                                </span>
                                <span className="text-[10px] font-bold opacity-40">VNĐ</span>
                            </div>
                        )}
                        <div className="flex items-center gap-2">
                            {pyc && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        window.open(`/pyc-print/${pyc.request_id}`, '_blank')
                                    }}
                                    className="rounded-xl px-5 h-10 font-medium border-primary/20 text-primary hover:bg-primary/5 mr-2"
                                >
                                    <Printer className="mr-2 h-4 w-4" />
                                    In phiếu
                                </Button>
                            )}
                            {currentStep === 1 ? (
                                <Button
                                    onClick={nextStep}
                                    className="rounded-xl px-6 h-10 font-bold shadow-lg shadow-primary/20 bg-primary hover:bg-primary/91 transition-all active:scale-95 flex items-center gap-2 text-[13px]"
                                >
                                    Tiếp tục
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            ) : (
                                <Button
                                    onClick={handleSubmit}
                                    disabled={isLoading}
                                    className="rounded-xl px-8 h-10 font-bold shadow-lg shadow-primary/20 bg-primary hover:bg-primary/91 transition-all active:scale-95 flex items-center gap-2 text-[13px]"
                                >
                                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                                        <>
                                            <Save className="mr-1.5 h-4 w-4" />
                                            {pyc ? 'Cập nhật' : 'Gửi yêu cầu'}
                                        </>
                                    )}
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </SheetContent>

            {/* Dialogs outside SheetContent for better isolation */}
            <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
                <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden rounded-3xl border-none shadow-2xl">
                    <div className="bg-primary/5 p-6 border-b border-primary/10">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                                <Package className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold tracking-tight text-foreground">Chi tiết hạng mục yêu cầu</h3>
                                <p className="text-[12px] text-muted-foreground">Nhập thông tin chi tiết cho vật tư/dịch vụ</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                        {selectedDetailIndex !== -1 && details[selectedDetailIndex] && (
                            <div className="grid gap-6">
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-[12px] font-semibold text-slate-700">Tên vật tư & Quy cách <span className="text-destructive">*</span></Label>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-7 text-[11px] text-primary hover:text-primary hover:bg-primary/10 rounded-lg gap-1.5 px-2"
                                            onClick={() => handleOpenResourceDialog(selectedDetailIndex)}
                                        >
                                            <Plus className="h-3.5 w-3.5" />
                                            Thêm tài nguyên mới
                                        </Button>
                                    </div>
                                    <ResourceCombobox
                                        value={details[selectedDetailIndex].item_name}
                                        onAddNew={() => handleOpenResourceDialog(selectedDetailIndex)}
                                        onChange={(val: string, unit: string | null, price: number | null, code: string) => {
                                            const newDetails = [...details]
                                            newDetails[selectedDetailIndex] = {
                                                ...newDetails[selectedDetailIndex],
                                                item_name: val,
                                                custom_item_name: val, // Default custom name to original
                                                unit: unit || newDetails[selectedDetailIndex].unit,
                                                unit_price: price || newDetails[selectedDetailIndex].unit_price,
                                                material_code: code || newDetails[selectedDetailIndex].material_code
                                            }
                                            setDetails(newDetails)
                                        }}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-[12px] font-semibold text-slate-700">Tên vật tư tùy chỉnh (Hiển thị trên phiếu)</Label>
                                    <Input
                                        value={details[selectedDetailIndex].custom_item_name || ''}
                                        onChange={e => handleDetailChange(selectedDetailIndex, 'custom_item_name', e.target.value)}
                                        placeholder="Để trống nếu muốn giữ nguyên tên gốc..."
                                        className="h-10 rounded-xl border-border/40 bg-muted/5 text-[13px]"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-5">
                                    <div className="space-y-2">
                                        <Label className="text-[12px] font-semibold text-slate-700">Đơn vị tính</Label>
                                        <Input
                                            value={details[selectedDetailIndex].unit || ''}
                                            onChange={e => handleDetailChange(selectedDetailIndex, 'unit', e.target.value)}
                                            placeholder="Bộ, Cái, m2..."
                                            className="h-10 rounded-xl border-border/40 bg-muted/5 text-[13px]"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[12px] font-semibold text-slate-700">Số lượng</Label>
                                        <Input
                                            type="number"
                                            value={details[selectedDetailIndex].quantity}
                                            onChange={e => handleDetailChange(selectedDetailIndex, 'quantity', e.target.value)}
                                            className="h-10 rounded-xl border-primary/20 bg-primary/[0.02] text-right font-bold text-primary text-[14px]"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-5">
                                    <div className="space-y-2">
                                        <Label className="text-[12px] font-semibold text-slate-700">Đơn giá trước thuế (VAT {details[selectedDetailIndex].vat_value || 0}%)</Label>
                                        <div className="relative">
                                            <Input
                                                value={formatNumber(details[selectedDetailIndex].unit_price)}
                                                onChange={e => {
                                                    const rawValue = parseFormattedNumber(e.target.value)
                                                    if (!isNaN(Number(rawValue)) || rawValue === '') {
                                                        handleDetailChange(selectedDetailIndex, 'unit_price', rawValue)
                                                    }
                                                }}
                                                className="h-10 rounded-xl border-border/40 bg-muted/5 text-right text-[13px] pr-12 font-medium"
                                            />
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-muted-foreground font-bold">VNĐ</span>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[12px] font-semibold text-slate-700">Đơn giá sau thuế</Label>
                                        <div className="relative">
                                            <Input
                                                value={formatNumber(
                                                    Number(details[selectedDetailIndex].unit_price || 0) * (1 + (Number(details[selectedDetailIndex].vat_value || 0) / 100))
                                                )}
                                                onChange={e => {
                                                    const rawValue = parseFormattedNumber(e.target.value)
                                                    if (!isNaN(Number(rawValue)) || rawValue === '') {
                                                        const vat = Number(details[selectedDetailIndex].vat_value || 0)
                                                        const beforeTax = Math.round(Number(rawValue) / (1 + (vat / 100)))
                                                        handleDetailChange(selectedDetailIndex, 'unit_price', beforeTax)
                                                    }
                                                }}
                                                className="h-10 rounded-xl border-primary/20 bg-primary/[0.02] text-right text-[13px] pr-12 font-bold text-primary"
                                            />
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-primary/60 font-bold">VNĐ</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-5 items-end">
                                    <div className="space-y-2">
                                        <Label className="text-[12px] font-semibold text-slate-700">VAT (%)</Label>
                                        <Select
                                            value={details[selectedDetailIndex].vat_display || DEFAULT_VAT_OPTION.display}
                                            onValueChange={v => {
                                                const option = VAT_OPTIONS.find(o => o.display === v)
                                                const newDetails = [...details]
                                                newDetails[selectedDetailIndex] = {
                                                    ...newDetails[selectedDetailIndex],
                                                    vat_display: v,
                                                    vat_value: option?.value ?? 0
                                                }
                                                setDetails(newDetails)
                                            }}
                                        >
                                            <SelectTrigger className="h-10 rounded-xl border-border/40 bg-muted/5 text-[13px] w-full">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-xl">
                                                {VAT_OPTIONS.map(opt => (
                                                    <SelectItem key={opt.display} value={opt.display} className="text-[13px]">{opt.display}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="p-3 bg-primary/5 rounded-xl border border-primary/10">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] uppercase font-bold text-primary/60 tracking-wider">Thành tiền sau thuế</span>
                                                <div className="flex items-baseline justify-end gap-1.5">
                                                    <span className="text-lg font-bold text-primary tabular-nums">
                                                        {formatCurrency(
                                                            Number(details[selectedDetailIndex].unit_price || 0) *
                                                            Number(details[selectedDetailIndex].quantity || 0) *
                                                            (1 + (Number(details[selectedDetailIndex].vat_value || 0) / 100))
                                                        )}
                                                    </span>
                                                    <span className="text-[10px] font-black text-primary/40 uppercase">VNĐ</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-[12px] font-semibold text-slate-700">Mục đích sử dụng chi tiết</Label>
                                    <Input
                                        value={details[selectedDetailIndex].muc_dich_sd || ''}
                                        onChange={e => handleDetailChange(selectedDetailIndex, 'muc_dich_sd', e.target.value)}
                                        placeholder="Giải trình lý do mua sắm chi tiết..."
                                        className="h-10 rounded-xl border-border/40 bg-muted/5 text-[13px]"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-5">
                                    <div className="space-y-2">
                                        <Label className="text-[12px] font-semibold text-slate-700">Hạng mục công trình</Label>
                                        <Select
                                            value={details[selectedDetailIndex].category || ''}
                                            onValueChange={v => handleCategoryChange(selectedDetailIndex, v)}
                                        >
                                            <SelectTrigger className="h-10 rounded-xl border-border/40 bg-muted/5 text-[13px] w-full">
                                                <SelectValue placeholder="Chọn hạng mục..." />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-xl">
                                                {TASK_CATEGORIES.map(cat => (
                                                    <SelectItem key={cat} value={cat} className="text-[13px]">{cat}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[12px] font-semibold text-slate-700">Công việc chi tiết</Label>
                                        <Select
                                            value={details[selectedDetailIndex].task_description || ''}
                                            onValueChange={v => handleDetailChange(selectedDetailIndex, 'task_description', v)}
                                            disabled={!details[selectedDetailIndex].category || loadingTasks[selectedDetailIndex]}
                                        >
                                            <SelectTrigger className="h-10 rounded-xl border-border/40 bg-muted/5 text-[13px] w-full">
                                                <SelectValue placeholder={!details[selectedDetailIndex].category ? "Chọn hạng mục trước" : "Chọn công việc..."} />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-xl">
                                                {(details[selectedDetailIndex].category ? tasksByCategory[details[selectedDetailIndex].category!] || [] : []).map(task => (
                                                    <SelectItem key={task.task_id} value={task.task_name} className="text-[13px]">{task.task_name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-[12px] font-semibold text-slate-700">Ghi chú & Quy cách thêm</Label>
                                    <Textarea
                                        value={details[selectedDetailIndex].notes || ''}
                                        onChange={e => handleDetailChange(selectedDetailIndex, 'notes', e.target.value)}
                                        placeholder="Thông số kỹ thuật hoặc các yêu cầu đặc biệt..."
                                        className="min-h-[80px] rounded-xl border-border/40 bg-muted/5 resize-none text-[13px]"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="p-4 border-t bg-muted/10 flex justify-end gap-3 px-6 py-4">
                        <Button
                            variant="default"
                            onClick={() => setIsDetailDialogOpen(false)}
                            className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 rounded-xl font-bold h-11 shadow-lg shadow-primary/20"
                        >
                            Hoàn tất
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            <ResourceDialog
                open={isResourceDialogOpen}
                onOpenChange={setIsResourceDialogOpen}
                resource={null}
                users={allUsers}
                projects={projects}
                onSuccess={handleResourceDialogSuccess}
            />
        </Sheet>
    )
}
