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
import { createPYC, updatePYC } from '@/lib/actions/pyc'
import { getTasksByCategory } from '@/lib/actions/tasks'
import { getAllResources } from '@/lib/actions/resources'
import { Plus, Trash2, Package, Calculator, Info, ChevronRight, ChevronLeft, Save, FileText, Loader2, UserPlus } from 'lucide-react'
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
    const [selectedDetailIndex, setSelectedDetailIndex] = useState<number>(0)

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
            setHeaderData({
                request_id: `PYC-${Date.now()}`,
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
        }
    }, [pyc, open, projectId])

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
            return sum + (Number(item.quantity || 0) * Number(item.unit_price || 0))
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

    const prevStep = () => setCurrentStep(prev => prev - 1)

    const SectionTitle = ({ icon: Icon, title }: { icon: any, title: string }) => (
        <div className="flex items-center gap-2 text-primary font-bold text-[10px] uppercase tracking-wider mb-4 mt-6 first:mt-0 opacity-70">
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
                <div className="bg-primary/5 p-6 border-b border-primary/10 sticky top-0 z-10 backdrop-blur-xl shrink-0">
                    <SheetHeader className="flex flex-row items-center gap-4 space-y-0 text-left">
                        <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shadow-inner">
                            <FileText className="h-7 w-7" />
                        </div>
                        <div className="flex-1">
                            <SheetTitle className="text-xl font-bold tracking-tight">
                                {pyc ? 'Cập nhật Phiếu yêu cầu' : 'Lập Phiếu yêu cầu mới'}
                            </SheetTitle>
                            <div className="flex items-center gap-3 mt-1.5">
                                <div
                                    onClick={() => setCurrentStep(1)}
                                    className={cn(
                                        "flex items-center gap-1 cursor-pointer transition-all",
                                        currentStep === 1 ? "text-primary font-medium" : "text-muted-foreground hover:text-foreground"
                                    )}
                                >
                                    <span className={cn(
                                        "h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold shadow-sm shrink-0",
                                        currentStep === 1 ? "bg-primary text-primary-foreground" : "bg-muted-foreground/20 text-muted-foreground"
                                    )}>1</span>
                                    <span className="text-xs">THÔNG TIN CHUNG</span>
                                </div>
                                <ChevronRight className="h-3 w-3 text-muted-foreground/20" />
                                <div
                                    onClick={() => {
                                        if (headerData.title) setCurrentStep(2)
                                        else alert("Vui lòng nhập tiêu đề phiếu trước khi qua Bước 2.")
                                    }}
                                    className={cn(
                                        "flex items-center gap-1 cursor-pointer transition-all",
                                        currentStep === 2 ? "text-primary font-medium" : "text-muted-foreground hover:text-foreground"
                                    )}
                                >
                                    <span className={cn(
                                        "h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold shadow-sm shrink-0",
                                        currentStep === 2 ? "bg-primary text-primary-foreground" : "bg-muted-foreground/20 text-muted-foreground"
                                    )}>2</span>
                                    <span className="text-xs">CHI TIẾT</span>
                                </div>
                            </div>
                        </div>
                    </SheetHeader>
                </div>

                {/* Content Section */}
                <div className="flex-1 overflow-y-auto p-8 bg-muted/5">
                    {currentStep === 1 && (
                        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                            {/* Card 1: Thông tin cơ bản */}
                            <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-sm">
                                <SectionTitle icon={Info} title="Thông tin cơ bản" />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-semibold">Mã phiếu</Label>
                                        <Input
                                            value={headerData.request_id}
                                            readOnly
                                            className="rounded-xl h-11 bg-muted/50 font-mono text-xs border-dashed"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-xs font-semibold">Dự án</Label>
                                        <Select
                                            value={headerData.project_id || "global"}
                                            onValueChange={v => setHeaderData({ ...headerData, project_id: v === "global" ? "" : v })}
                                        >
                                            <SelectTrigger className="rounded-xl h-11 border-border/40 bg-card/40">
                                                <SelectValue placeholder="Chọn dự án" />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-xl">
                                                <SelectItem value="global">Dùng chung (Toàn bộ)</SelectItem>
                                                {projects.map(p => (
                                                    <SelectItem key={p.project_id} value={p.project_id}>{p.project_name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2 md:col-span-2">
                                        <Label className="text-xs font-semibold">Tiêu đề phiếu <span className="text-destructive">*</span></Label>
                                        <Input
                                            value={headerData.title}
                                            onChange={e => setHeaderData({ ...headerData, title: e.target.value })}
                                            placeholder="VD: Yêu cầu vật tư thi công tầng 5..."
                                            className="rounded-xl h-11 border-border/40 bg-card/40"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-xs font-semibold">Loại yêu cầu</Label>
                                        <Select value={headerData.request_type!} onValueChange={v => setHeaderData({ ...headerData, request_type: v as any })}>
                                            <SelectTrigger className="rounded-xl h-11 border-border/40 bg-card/40">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-xl">
                                                {LOAI_PHIEU.map(t => (
                                                    <SelectItem key={t} value={t}>{t}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-xs font-semibold">Độ ưu tiên</Label>
                                        <Select value={headerData.priority!} onValueChange={v => setHeaderData({ ...headerData, priority: v as any })}>
                                            <SelectTrigger className="rounded-xl h-11 border-border/40 bg-card/40">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-xl">
                                                {MUC_DO_UU_TIEN.map(p => (
                                                    <SelectItem key={p} value={p}>{p}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-xs font-semibold">VAT mặc định</Label>
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
                                            <SelectTrigger className="rounded-xl h-11 border-border/40 bg-card/40">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-xl">
                                                {VAT_OPTIONS.map(opt => (
                                                    <SelectItem key={opt.display} value={opt.display}>{opt.display}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-xs font-semibold">Hạng mục công việc chính</Label>
                                        <Select
                                            value={headerData.task_category}
                                            onValueChange={v => setHeaderData({ ...headerData, task_category: v })}
                                        >
                                            <SelectTrigger className="rounded-xl h-11 border-border/40 bg-card/40">
                                                <SelectValue placeholder="Chọn hạng mục chính..." />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-xl">
                                                {TASK_CATEGORIES.map(cat => (
                                                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2 md:col-span-2">
                                        <Label className="text-xs font-semibold">Mục đích sử dụng</Label>
                                        <Input
                                            value={headerData.muc_dich_sd}
                                            onChange={e => setHeaderData({ ...headerData, muc_dich_sd: e.target.value })}
                                            placeholder="VD: Phục vụ thi công kết cấu hầm..."
                                            className="rounded-xl h-11 border-border/40 bg-card/40"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Card 2: Ghi chú */}
                            <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-sm">
                                <SectionTitle icon={Calculator} title="Thiết lập tài chính & Ghi chú" />
                                <div className="space-y-5">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-semibold">Ghi chú phiếu</Label>
                                        <Textarea
                                            value={headerData.notes || ''}
                                            onChange={e => setHeaderData({ ...headerData, notes: e.target.value })}
                                            placeholder="Lý do yêu cầu chi tiết hoặc các lưu ý đặc biệt..."
                                            className="min-h-[80px] rounded-xl border-border/40 bg-card/40 resize-none"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Card 3: Tài liệu đính kèm */}
                            <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-sm md:col-span-2">
                                <div className="flex items-center justify-between mb-4">
                                    <SectionTitle icon={FileText} title="Tài liệu đính kèm" />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setHeaderData({
                                            ...headerData,
                                            attachments: [...(headerData.attachments || []), { name: '', description: '', url: '' }]
                                        })}
                                        className="h-8 rounded-lg border-primary/20 bg-primary/5 text-primary hover:bg-primary/10"
                                    >
                                        <Plus className="h-3.5 w-3.5 mr-1.5" />
                                        Thêm tài liệu
                                    </Button>
                                </div>

                                <div className="space-y-3">
                                    {(headerData.attachments || []).map((att, idx) => (
                                        <div key={idx} className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 rounded-xl border border-border/40 bg-card/20 relative group">
                                            <div className="space-y-1.5">
                                                <Label className="text-[11px] font-medium text-muted-foreground">Tên tài liệu</Label>
                                                <Input
                                                    value={att.name}
                                                    onChange={e => {
                                                        const newAtts = [...(headerData.attachments || [])]
                                                        newAtts[idx].name = e.target.value
                                                        setHeaderData({ ...headerData, attachments: newAtts })
                                                    }}
                                                    placeholder="VD: Bản vẽ kỹ thuật..."
                                                    className="h-9 rounded-lg border-border/40 bg-background/50 text-xs"
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label className="text-[11px] font-medium text-muted-foreground">Mô tả</Label>
                                                <Input
                                                    value={att.description}
                                                    onChange={e => {
                                                        const newAtts = [...(headerData.attachments || [])]
                                                        newAtts[idx].description = e.target.value
                                                        setHeaderData({ ...headerData, attachments: newAtts })
                                                    }}
                                                    placeholder="Mô tả nội dung tài liệu..."
                                                    className="h-9 rounded-lg border-border/40 bg-background/50 text-xs"
                                                />
                                            </div>
                                            <div className="space-y-1.5 relative">
                                                <Label className="text-[11px] font-medium text-muted-foreground">Link đính kèm</Label>
                                                <Input
                                                    value={att.url}
                                                    onChange={e => {
                                                        const newAtts = [...(headerData.attachments || [])]
                                                        newAtts[idx].url = e.target.value
                                                        setHeaderData({ ...headerData, attachments: newAtts })
                                                    }}
                                                    placeholder="https://..."
                                                    className="h-9 rounded-lg border-border/40 bg-background/50 text-xs pr-8"
                                                />
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => {
                                                        const newAtts = (headerData.attachments || []).filter((_, i) => i !== idx)
                                                        setHeaderData({ ...headerData, attachments: newAtts })
                                                    }}
                                                    className="absolute right-0 bottom-0 h-9 w-9 text-muted-foreground hover:text-destructive transition-colors"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                    {(headerData.attachments || []).length === 0 && (
                                        <div className="text-center py-6 border border-dashed border-border/60 rounded-xl bg-card/10 text-muted-foreground text-xs italic">
                                            Chưa có tài liệu đính kèm. Nhấp vào "Thêm tài liệu" để bắt đầu.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {currentStep === 2 && (
                        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                            <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-sm overflow-hidden flex flex-col">
                                <div className="flex items-center justify-between mb-6 shrink-0">
                                    <SectionTitle icon={Package} title="Chi tiết phiếu" />
                                    <Button type="button" variant="outline" size="sm" onClick={handleAddDetail} className="h-9 rounded-xl border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 px-4">
                                        <Plus className="h-4 w-4 mr-2" />
                                        Thêm dòng
                                    </Button>
                                </div>

                                <div className="space-y-6">
                                    <div className="rounded-xl border border-border/40 bg-card/30 overflow-hidden shadow-sm">
                                        <Table>
                                            <TableHeader className="bg-muted/30">
                                                <TableRow className="hover:bg-transparent border-border/30">
                                                    <TableHead className="w-[50px] text-center text-[12px] font-semibold text-slate-700">TT</TableHead>
                                                    <TableHead className="min-w-[250px] text-[12px] font-semibold text-slate-700">Tên vật tư & Quy cách</TableHead>
                                                    <TableHead className="w-[80px] text-center text-[12px] font-semibold text-slate-700">ĐVT</TableHead>
                                                    <TableHead className="w-[100px] text-right text-[12px] font-semibold text-slate-700">Số lượng</TableHead>
                                                    <TableHead className="w-[120px] text-right text-[12px] font-semibold text-slate-700">Đơn giá</TableHead>
                                                    <TableHead className="w-[100px] text-center text-[12px] font-semibold text-slate-700">VAT</TableHead>
                                                    <TableHead className="w-[140px] text-right text-[12px] font-semibold text-slate-700">Thành tiền</TableHead>
                                                    <TableHead className="w-[50px]"></TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {details.map((detail, index) => (
                                                    <TableRow
                                                        key={index}
                                                        className={cn(
                                                            "group transition-all duration-200 border-border/20",
                                                            selectedDetailIndex === index ? "bg-primary/[0.06] ring-2 ring-inset ring-primary/30" : "hover:bg-primary/[0.01]"
                                                        )}
                                                        onClick={() => setSelectedDetailIndex(index)}
                                                    >
                                                        <TableCell className="p-3 text-center align-middle text-[11px] text-muted-foreground/50 font-semibold">
                                                            {String(index + 1).padStart(2, '0')}
                                                        </TableCell>

                                                        <TableCell className="px-4 py-3 align-middle">
                                                            <div className="space-y-2 min-w-[220px]">
                                                                <ResourceCombobox
                                                                    value={detail.item_name}
                                                                    onAddNew={() => handleOpenResourceDialog(index)}
                                                                    onChange={(val: string, unit: string | null, price: number | null, code: string) => {
                                                                        const newDetails = [...details]
                                                                        newDetails[index] = {
                                                                            ...newDetails[index],
                                                                            item_name: val,
                                                                            unit: unit || newDetails[index].unit,
                                                                            unit_price: price || newDetails[index].unit_price,
                                                                            material_code: code || newDetails[index].material_code
                                                                        }
                                                                        setDetails(newDetails)
                                                                    }}
                                                                />
                                                                <Input
                                                                    placeholder="Mô tả quy cách, thông số..."
                                                                    value={detail.notes || ''}
                                                                    onChange={e => handleDetailChange(index, 'notes', e.target.value)}
                                                                    className="h-9 rounded-lg border-border/10 bg-transparent text-[12px] placeholder:text-muted-foreground/30 focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary/40 transition-all duration-200"
                                                                />
                                                            </div>
                                                        </TableCell>

                                                        <TableCell className="p-3 align-middle text-center">
                                                            <Input
                                                                value={detail.unit || ''}
                                                                onChange={e => handleDetailChange(index, 'unit', e.target.value)}
                                                                className="h-10 w-16 mx-auto rounded-lg border-border/10 bg-muted/5 text-center text-[12px] font-medium focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary/40 transition-all duration-200"
                                                            />
                                                        </TableCell>

                                                        <TableCell className="p-3 align-middle">
                                                            <Input
                                                                type="number"
                                                                value={detail.quantity}
                                                                onChange={e => handleDetailChange(index, 'quantity', e.target.value)}
                                                                className="h-10 rounded-lg border-primary/10 bg-card/50 text-right text-[13px] font-semibold text-primary px-3 shadow-sm focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:border-primary/40 transition-all duration-200"
                                                            />
                                                        </TableCell>

                                                        <TableCell className="p-3 align-middle">
                                                            <Input
                                                                type="number"
                                                                value={detail.unit_price}
                                                                onChange={e => handleDetailChange(index, 'unit_price', e.target.value)}
                                                                className="h-10 rounded-lg border-border/20 bg-muted/5 text-right text-[13px] font-medium px-3 focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary/40 transition-all duration-200"
                                                            />
                                                        </TableCell>

                                                        <TableCell className="p-3 align-middle">
                                                            <Select
                                                                value={detail.vat_display || DEFAULT_VAT_OPTION.display}
                                                                onValueChange={v => {
                                                                    const option = VAT_OPTIONS.find(o => o.display === v)
                                                                    const newDetails = [...details]
                                                                    newDetails[index] = {
                                                                        ...newDetails[index],
                                                                        vat_display: v,
                                                                        vat_value: option?.value ?? 0
                                                                    }
                                                                    setDetails(newDetails)
                                                                }}
                                                            >
                                                                <SelectTrigger className="h-10 rounded-lg border-border/10 bg-muted/5 text-[12px] font-medium shadow-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all duration-200">
                                                                    <SelectValue />
                                                                </SelectTrigger>
                                                                <SelectContent className="rounded-xl border-border/40">
                                                                    {VAT_OPTIONS.map(opt => (
                                                                        <SelectItem key={opt.display} value={opt.display} className="text-[12px]">{opt.display}</SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                        </TableCell>

                                                        <TableCell className="p-3 text-right align-middle">
                                                            <div className="flex flex-col items-end pr-2">
                                                                <span className="text-[14px] font-bold text-primary tracking-tight">
                                                                    {new Intl.NumberFormat('vi-VN').format(Number(detail.quantity || 0) * Number(detail.unit_price || 0))}
                                                                </span>
                                                                <span className="text-[10px] font-semibold text-muted-foreground/30 leading-none">VNĐ</span>
                                                            </div>
                                                        </TableCell>

                                                        <TableCell className="p-3 text-center align-middle">
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={(e) => {
                                                                    e.stopPropagation()
                                                                    handleRemoveDetail(index)
                                                                }}
                                                                className="h-8 w-8 text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10 transition-all duration-200 opacity-0 group-hover:opacity-100"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>

                                    {/* External Metadata Selection Form */}
                                    {details.length > 0 && selectedDetailIndex !== -1 && details[selectedDetailIndex] && (
                                        <div className="relative animate-in fade-in slide-in-from-bottom-2 duration-300">
                                            <div className="absolute -top-3 left-6 px-2 bg-background z-10">
                                                <span className="text-[10px] uppercase font-bold text-primary/60 tracking-widest flex items-center gap-2">
                                                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                                                    Thông tin chi tiết dòng #{selectedDetailIndex + 1}
                                                </span>
                                            </div>
                                            <div className="rounded-2xl border border-primary/30 bg-primary/[0.03] p-6 pt-8 shadow-[0_12px_40px_rgb(0,0,0,0.06)] ring-1 ring-primary/10">
                                                <div className="space-y-6">
                                                    {/* Row 1: Resource Name & Purpose */}
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                        <div className="space-y-2">
                                                            <Label className="text-[12px] font-semibold text-slate-700 flex items-center gap-2">
                                                                <div className="w-1.5 h-1.5 rounded-full bg-primary/40" />
                                                                Tên vật tư chi tiết & Quy cách
                                                            </Label>
                                                            <Input
                                                                value={details[selectedDetailIndex].item_name || ''}
                                                                onChange={e => handleDetailChange(selectedDetailIndex, 'item_name', e.target.value)}
                                                                placeholder="Chỉnh sửa tên vật tư hoặc quy cách..."
                                                                className="h-11 rounded-xl border-border/40 bg-card text-[13px] shadow-sm focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary/40 transition-all duration-200"
                                                            />
                                                        </div>

                                                        <div className="space-y-2">
                                                            <Label className="text-[12px] font-semibold text-slate-700 flex items-center gap-2">
                                                                <div className="w-1.5 h-1.5 rounded-full bg-primary/40" />
                                                                Mục đích sử dụng chi tiết
                                                            </Label>
                                                            <Input
                                                                value={details[selectedDetailIndex].muc_dich_sd || ''}
                                                                onChange={e => handleDetailChange(selectedDetailIndex, 'muc_dich_sd', e.target.value)}
                                                                placeholder="Nhập giải trình chi tiết..."
                                                                className="h-11 rounded-xl border-border/40 bg-card text-[13px] shadow-sm focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary/40 transition-all duration-200"
                                                            />
                                                        </div>
                                                    </div>

                                                    {/* Row 2: Category & Task */}
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                        <div className="space-y-2">
                                                            <Label className="text-[12px] font-semibold text-slate-700 flex items-center gap-2">
                                                                <div className="w-1.5 h-1.5 rounded-full bg-primary/40" />
                                                                Hạng mục công trình
                                                            </Label>
                                                            <Select
                                                                value={details[selectedDetailIndex].category || ''}
                                                                onValueChange={v => handleCategoryChange(selectedDetailIndex, v)}
                                                            >
                                                                <SelectTrigger className="h-11 rounded-xl border-border/40 bg-card text-[13px] shadow-sm hover:border-primary/40 focus:ring-2 focus:ring-primary/20 transition-all duration-200">
                                                                    <SelectValue placeholder="Chọn hạng mục phân loại..." />
                                                                </SelectTrigger>
                                                                <SelectContent className="rounded-xl border-border/40">
                                                                    {TASK_CATEGORIES.map(cat => (
                                                                        <SelectItem key={cat} value={cat} className="text-[13px] py-2.5">{cat}</SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                        </div>

                                                        <div className="space-y-2">
                                                            <Label className="text-[12px] font-semibold text-slate-700 flex items-center gap-2">
                                                                <div className="w-1.5 h-1.5 rounded-full bg-primary/40" />
                                                                Tên công việc cụ thể
                                                            </Label>
                                                            <Select
                                                                value={details[selectedDetailIndex].task_description || ''}
                                                                onValueChange={v => handleDetailChange(selectedDetailIndex, 'task_description', v)}
                                                                disabled={!details[selectedDetailIndex].category || loadingTasks[selectedDetailIndex]}
                                                            >
                                                                <SelectTrigger className="h-11 rounded-xl border-border/40 bg-card text-[13px] shadow-sm hover:border-primary/40 focus:ring-2 focus:ring-primary/20 transition-all duration-200">
                                                                    <SelectValue placeholder={!details[selectedDetailIndex].category ? "Vui lòng chọn hạng mục trước..." : "Chọn loại công việc..."} />
                                                                </SelectTrigger>
                                                                <SelectContent className="rounded-xl border-border/40">
                                                                    {(details[selectedDetailIndex].category ? tasksByCategory[details[selectedDetailIndex].category!] || [] : []).map(task => (
                                                                        <SelectItem key={task.task_id} value={task.task_name} className="text-[13px] py-2.5">{task.task_name}</SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Actions Section */}
                <div className="p-6 border-t bg-background sticky bottom-0 z-10 flex items-center justify-between shadow-[0_-10px_40px_rgba(0,0,0,0.03)] shrink-0">
                    <Button
                        variant="ghost"
                        onClick={currentStep === 1 ? () => onOpenChange(false) : prevStep}
                        disabled={isLoading}
                        className="rounded-xl px-6 h-12 font-medium hover:bg-muted"
                    >
                        {currentStep === 1 ? 'Thoát' : (
                            <>
                                <ChevronLeft className="mr-2 h-4 w-4" />
                                Quay lại trang trước
                            </>
                        )}
                    </Button>

                    <div className="flex flex-col items-end gap-2">
                        {currentStep === 2 && (
                            <div className="flex items-center gap-2 text-muted-foreground/80 px-4">
                                <span className="text-[11px] font-medium">Tổng tiền dự kiến (tạm tính):</span>
                                <span className="text-sm font-bold text-primary">
                                    {new Intl.NumberFormat('vi-VN').format(calculateTotal())}
                                </span>
                                <span className="text-[10px] font-medium">VNĐ</span>
                            </div>
                        )}
                        <div className="flex items-center gap-3">
                            {currentStep === 1 ? (
                                <Button
                                    onClick={nextStep}
                                    className="rounded-xl px-8 h-12 font-bold shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90 transition-all active:scale-95 flex items-center gap-2"
                                >
                                    Tiếp tục: Nhập hạng mục
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            ) : (
                                <Button
                                    onClick={handleSubmit}
                                    disabled={isLoading}
                                    className="rounded-xl px-10 h-12 font-bold shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90 transition-all active:scale-95 flex items-center gap-2"
                                >
                                    {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                                        <>
                                            <Save className="mr-2 h-4 w-4" />
                                            {pyc ? 'Cập nhật thay đổi' : 'Gửi yêu cầu phê duyệt'}
                                        </>
                                    )}
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </SheetContent>

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
