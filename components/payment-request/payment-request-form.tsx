'use client'

import { useState, useEffect, useMemo } from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table'
import { AttachmentList } from '@/components/shared/attachment-list'
import {
    Plus,
    Search,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    Loader2,
    FileText,
    Truck,
    Wallet,
    Info,
    Calendar,
    Users,
    Clock
} from 'lucide-react'
import { getApprovedPYCs, createPaymentRequest, getNextDNTTSequence } from '@/lib/actions/payment-requests'
import { getSuppliers, addSupplier, getExpenseCategories } from '@/lib/actions/system'
import { getProjects, getProjectById } from '@/lib/actions/projects'
import { getPersonnelList } from '@/lib/actions/personnel'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Check, ChevronsUpDown } from "lucide-react"

interface PaymentRequestFormProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    projectId?: string
    onSuccess?: () => void
}

export function PaymentRequestForm({ open, onOpenChange, projectId: initialProjectId, onSuccess }: PaymentRequestFormProps) {
    const [step, setStep] = useState(1) // 1: Select PYCs, 2: Select Items, 3: General Info
    const [loading, setLoading] = useState(false)
    const [pycs, setPycs] = useState<any[]>([])
    const [suppliers, setSuppliers] = useState<any[]>([])
    const [projects, setProjects] = useState<any[]>([])
    const [personnel, setPersonnel] = useState<any[]>([])
    const [expenseCategories, setExpenseCategories] = useState<any[]>([])
    const [selectedProjectId, setSelectedProjectId] = useState<string>(initialProjectId || 'all')
    const [pycSearch, setPycSearch] = useState('')
    const [selectedPYCIds, setSelectedPYCIds] = useState<string[]>([])
    const [selectedItems, setSelectedItems] = useState<any[]>([])
    const [isAddingSupplier, setIsAddingSupplier] = useState(false)
    const [newSupplier, setNewSupplier] = useState({ supplier_name: '', tax_code: '' })
    const [headerData, setHeaderData] = useState({
        payment_request_id: `DNTT-${Date.now().toString().slice(-6)}`,
        request_date: new Date().toISOString().split('T')[0],
        payment_reason: '',
        supplier_name: '',
        supplier_tax_code: '',
        payment_method: 'Chuyển khoản',
        payment_type_code: 'CK',
        document_number: '',
        payer_type: 'BĐH DA',
        expense_type_name: '',
        expense_group_name: '',
        contract_type_code: '',
        notes: '',
        pyc_classification: '',
        project_id: initialProjectId || null
    })

    useEffect(() => {
        if (open) {
            loadProjects()
            loadPYCs()
            loadSuppliers()
            loadPersonnel()
            loadExpenseCategories()
            setStep(1)
            setSelectedPYCIds([])
            setSelectedItems([])
            updateDNTTId()
        }
    }, [open, selectedProjectId])

    const updateDNTTId = async () => {
        if (selectedProjectId === 'all') {
            setHeaderData(prev => ({
                ...prev,
                payment_request_id: `DNTT-${Date.now().toString().slice(-6)}`
            }))
            return
        }

        try {
            const project = await getProjectById(selectedProjectId)
            if (!project) return

            const now = new Date()
            const month = String(now.getMonth() + 1).padStart(2, '0')
            const projectCode = project.project_id // Or use a short code if exists

            const nextSeq = await getNextDNTTSequence(projectCode, month)
            const formattedSeq = String(nextSeq).padStart(4, '0')

            const newId = `DNTT/${projectCode}/${month}/${formattedSeq}`
            setHeaderData(prev => ({
                ...prev,
                payment_request_id: newId
            }))
        } catch (error) {
            console.error("Error updating DNTT ID:", error)
        }
    }

    const loadProjects = async () => {
        try {
            const data = await getProjects()
            setProjects(data || [])
        } catch (error) {
            console.error("Error loading projects:", error)
        }
    }

    const loadSuppliers = async () => {
        try {
            const data = await getSuppliers(selectedProjectId === 'all' ? undefined : selectedProjectId)
            setSuppliers(data || [])
        } catch (error) {
            console.error("Error loading suppliers:", error)
        }
    }

    const loadPersonnel = async () => {
        try {
            const data = await getPersonnelList()
            setPersonnel(data || [])
        } catch (error) {
            console.error("Error loading personnel:", error)
        }
    }

    const loadExpenseCategories = async () => {
        try {
            const data = await getExpenseCategories()
            setExpenseCategories(data || [])
        } catch (error) {
            console.error("Error loading expense categories:", error)
        }
    }

    const loadPYCs = async () => {
        try {
            setLoading(true)
            const data = await getApprovedPYCs(selectedProjectId === 'all' ? undefined : selectedProjectId)
            setPycs(data || [])
        } catch (error) {
            toast.error("Lỗi khi tải danh sách PYC")
        } finally {
            setLoading(false)
        }
    }

    const filteredPYCs = useMemo(() => {
        if (!pycSearch.trim()) return pycs
        const search = pycSearch.toLowerCase()
        return pycs.filter(p =>
            p.request_id.toLowerCase().includes(search) ||
            p.title.toLowerCase().includes(search)
        )
    }, [pycs, pycSearch])

    const availableItems = useMemo(() => {
        return pycs
            .filter(p => selectedPYCIds.includes(p.request_id))
            .flatMap(p => p.pyc_detail.map((d: any) => {
                const qty = Number(d.quantity || 0)
                const price = Number(d.unit_price || 0)
                const vatRate = Number(d.vat_value || 0) / 100 // Assuming vat_value is percentage like 10
                const gross = qty * price
                const net = gross / (1 + vatRate)
                const vatAmount = gross - net

                return {
                    ...d,
                    pyc_request_id: p.request_id,
                    project_name: p.projects?.project_name,
                    calculated_gross: gross,
                    calculated_net: net,
                    calculated_vat_amount: vatAmount,
                    vat_rate: vatRate * 100
                }
            }))
    }, [pycs, selectedPYCIds])

    useEffect(() => {
        if (selectedItems.length > 0 && !headerData.payment_reason) {
            const firstItem = selectedItems[0]
            const pyc = pycs.find(p => p.request_id === firstItem.pyc_request_id)
            setHeaderData(prev => ({
                ...prev,
                payment_reason: `Thanh toán cho ${pyc?.title || 'PYC'}`,
                pyc_classification: pyc?.request_type || ''
            }))
        }
    }, [selectedItems, pycs])

    const totals = useMemo(() => {
        return selectedItems.reduce((acc, item) => {
            const qty = Number(item.quantity || 0)
            const price = Number(item.unit_price || 0)
            const vatRate = Number(item.vat_value || 0) / 100
            const gross = qty * price
            const net = gross / (1 + vatRate)
            const vatAmount = gross - net

            acc.gross += gross
            acc.net += net
            acc.vat += vatAmount
            return acc
        }, { gross: 0, net: 0, vat: 0 })
    }, [selectedItems])

    // Helper to format number with thousand separators
    const formatNumber = (num: number | string) => {
        if (num === '' || num === null || num === undefined) return ''
        const val = typeof num === 'string' ? parseFloat(num.replace(/[^0-9.-]+/g, "")) : num
        if (isNaN(val)) return ''
        return new Intl.NumberFormat('vi-VN').format(val)
    }

    // Helper to parse formatted string back to number
    const parseNumber = (str: string) => {
        return parseFloat(str.replace(/\./g, '').replace(/,/g, '.')) || 0
    }

    const handleItemChange = (itemId: string, field: 'quantity' | 'unit_price', value: string) => {
        const numValue = parseNumber(value)

        setSelectedItems(prev => prev.map(item => {
            if (item.id === itemId) {
                const updatedItem = {
                    ...item,
                    [field]: numValue,
                    [field === 'quantity' ? 'is_qty_from_pyc' : 'is_price_from_pyc']: false
                }

                // Recalculate derived values for this item
                const qty = Number(updatedItem.quantity || 0)
                const price = Number(updatedItem.unit_price || 0)
                const vatRate = Number(updatedItem.vat_value || 0) / 100
                const gross = qty * price
                const net = gross / (1 + vatRate)
                const vatAmount = gross - net

                return {
                    ...updatedItem,
                    calculated_gross: gross,
                    calculated_net: net,
                    calculated_vat_amount: vatAmount
                }
            }
            return item
        }))
    }

    const handleQuickAddSupplier = async () => {
        if (!newSupplier.supplier_name) {
            toast.error("Vui lòng nhập tên nhà cung cấp")
            return
        }
        try {
            setLoading(true)
            const result = await addSupplier({
                ...newSupplier,
                id: `NCC${Date.now().toString().slice(-6)}`,
                project_id: selectedProjectId === 'all' ? null : selectedProjectId
            })
            setSuppliers(prev => [...prev, result])
            setHeaderData(prev => ({ ...prev, supplier_name: result.supplier_name, supplier_tax_code: result.tax_code || '' }))
            setIsAddingSupplier(false)
            setNewSupplier({ supplier_name: '', tax_code: '' })
            toast.success("Thêm nhà cung cấp mới thành công")
        } catch (error) {
            toast.error("Lỗi khi thêm nhà cung cấp")
        } finally {
            setLoading(false)
        }
    }

    const handleNext = () => {
        if (step === 1 && selectedPYCIds.length === 0) {
            toast.error("Vui lòng chọn ít nhất một PYC")
            return
        }
        if (step === 2 && selectedItems.length === 0) {
            toast.error("Vui lòng chọn ít nhất một hạng mục")
            return
        }

        if (step === 1) {
            // Auto select all items from selected PYCs if entering Step 2
            setSelectedItems(availableItems)
        }

        setStep(step + 1)
    }

    const handleBack = () => setStep(step - 1)

    const handleStepClick = (targetStep: number) => {
        if (targetStep === step) return

        // Validation for moving forward
        if (targetStep > 1 && selectedPYCIds.length === 0) {
            toast.error("Vui lòng chọn ít nhất một PYC trước khi sang bước tiếp theo")
            return
        }
        if (targetStep > 2 && selectedItems.length === 0) {
            toast.error("Vui lòng chọn ít nhất một hạng mục")
            return
        }
        if (targetStep === 2 && step === 1) {
            setSelectedItems(availableItems)
        }

        setStep(targetStep)
    }

    const handleSubmit = async () => {
        // Validation for mandatory fields
        if (!headerData.payment_request_id) { toast.error("Vui lòng nhập Mã đề nghị thanh toán"); return }
        if (!headerData.request_date) { toast.error("Vui lòng chọn Ngày đề nghị"); return }
        if (!headerData.payment_reason) { toast.error("Vui lòng nhập Lý do thanh toán"); return }
        if (!headerData.supplier_name) { toast.error("Vui lòng chọn Nhà cung cấp"); return }
        if (!headerData.expense_type_name) { toast.error("Vui lòng chọn Loại chi phí"); return }
        if (!headerData.contract_type_code) { toast.error("Vui lòng chọn Loại hợp đồng"); return }
        if (!headerData.document_number) { toast.error("Vui lòng nhập Số chứng từ"); return }
        if (!headerData.payer_type) { toast.error("Vui lòng chọn Đối tượng chi trả"); return }
        if (!headerData.payment_type_code) { toast.error("Vui lòng chọn Phương thức thanh toán"); return }

        try {
            setLoading(true)

            // Prepare items for dntt_detail
            const items = selectedItems.map(item => ({
                item_name: item.item_name,
                unit: item.unit,
                quantity: item.quantity,
                unit_price: item.unit_price,
                vat_value: item.vat_value,
                is_qty_from_pyc: item.is_qty_from_pyc ?? true,
                is_price_from_pyc: item.is_price_from_pyc ?? true,
                pyc_request_id: item.pyc_request_id
            }))

            const dnttData = {
                ...headerData,
                project_id: selectedProjectId === 'all' ? null : selectedProjectId,
                total_gross: totals.gross,
                total_net: totals.net,
                vat_amount: totals.vat,
                // Legacy support for flat structure if needed
                quantity: selectedItems.length > 1 ? null : selectedItems[0]?.quantity,
                unit_price_gross: selectedItems.length > 1 ? null : selectedItems[0]?.unit_price,
                vat_rate: selectedItems.length > 1 ? null : selectedItems[0]?.vat_rate,
                unit_price_net: selectedItems.length > 1 ? (totals.net) : (selectedItems[0]?.calculated_net / selectedItems[0]?.quantity),
                items: items
            }

            await createPaymentRequest(dnttData)
            toast.success("Tạo đề nghị thanh toán thành công")
            onSuccess?.()
            onOpenChange(false)
        } catch (error: any) {
            console.error(error)
            toast.error("Lỗi khi tạo đề nghị thanh toán")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[1000px] max-h-[90vh] overflow-hidden p-0 rounded-3xl border-none shadow-2xl flex flex-col font-inter">
                <DialogHeader className="p-6 bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800 shrink-0">
                    <DialogTitle className="text-xl font-bold flex items-center gap-2 text-slate-800 dark:text-slate-100">
                        <Wallet className="h-5 w-5 text-primary" />
                        Lập Đề nghị thanh toán (DNTT)
                    </DialogTitle>
                    <DialogDescription className="text-[13px] text-slate-500 mt-1">
                        Kế thừa dữ liệu từ các Phiếu yêu cầu (PYC) đã được phê duyệt.
                    </DialogDescription>

                    {/* Stepper UI */}
                    <div className="flex items-center justify-center mt-6 gap-2">
                        {[1, 2, 3].map((s) => (
                            <div key={s} className="flex items-center">
                                <button
                                    type="button"
                                    onClick={() => handleStepClick(s)}
                                    className={cn(
                                        "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all border-none outline-none cursor-pointer hover:opacity-80",
                                        step === s ? "bg-primary text-white shadow-lg shadow-primary/20 scale-110" :
                                            step > s ? "bg-emerald-500 text-white" : "bg-slate-200 dark:bg-slate-800 text-slate-500"
                                    )}
                                >
                                    {step > s ? <CheckCircle2 className="h-4 w-4" /> : s}
                                </button>
                                {s < 3 && <div className={cn("w-12 h-0.5 mx-2", step > s ? "bg-emerald-500" : "bg-slate-200 dark:bg-slate-800")} />}
                            </div>
                        ))}
                    </div>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto p-6 min-h-[400px]">
                    {step === 1 && (
                        <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="flex flex-col md:flex-row gap-4 items-end bg-slate-50 dark:bg-slate-900/50 p-6 rounded-3xl border border-slate-100 dark:border-slate-800">
                                <div className="grid gap-2 flex-grow">
                                    <Label className="text-[11px] font-medium text-slate-500 ml-1 uppercase tracking-widest">Chọn Dự án</Label>
                                    <Select
                                        value={selectedProjectId}
                                        onValueChange={setSelectedProjectId}
                                    >
                                        <SelectTrigger className="h-11 rounded-lg border-slate-200 bg-white dark:bg-slate-950 text-[13px] font-medium text-slate-700">
                                            <SelectValue placeholder="Tất cả dự án..." />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-lg border-slate-100 shadow-xl">
                                            <SelectItem value="all" className="text-[13px]">Tất cả dự án</SelectItem>
                                            {projects.map(p => (
                                                <SelectItem key={p.project_id} value={p.project_id} className="text-[13px]">{p.project_name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-2 flex-grow max-w-md">
                                    <Label className="text-[11px] font-medium text-slate-500 ml-1 uppercase tracking-widest">Tìm kiếm PYC</Label>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                        <Input
                                            placeholder="Mã hoặc tiêu đề phiếu..."
                                            value={pycSearch}
                                            onChange={(e) => setPycSearch(e.target.value)}
                                            className="h-11 pl-10 rounded-lg border-slate-200 bg-white dark:bg-slate-950 text-[13px] font-medium text-slate-700"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="border border-slate-100 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm bg-white dark:bg-slate-950 h-[400px] flex flex-col">
                                <div className="flex-grow overflow-auto custom-scrollbar">
                                    <Table>
                                        <TableHeader className="bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur sticky top-0 z-10">
                                            <TableRow className="hover:bg-transparent border-slate-100">
                                                <TableHead className="w-[50px] text-center">
                                                    <Checkbox
                                                        checked={filteredPYCs.length > 0 && selectedPYCIds.length === filteredPYCs.length}
                                                        onCheckedChange={(checked) => {
                                                            if (checked) {
                                                                setSelectedPYCIds(filteredPYCs.map(p => p.request_id))
                                                            } else {
                                                                setSelectedPYCIds([])
                                                            }
                                                        }}
                                                        className="rounded-md border-slate-300"
                                                    />
                                                </TableHead>
                                                <TableHead className="text-[11px] font-medium uppercase tracking-wider text-slate-500">Mã PYC</TableHead>
                                                <TableHead className="text-[11px] font-medium uppercase tracking-wider text-slate-500">Dự án</TableHead>
                                                <TableHead className="text-[11px] font-medium uppercase tracking-wider text-slate-500">Tiêu đề</TableHead>
                                                <TableHead className="text-[11px] font-medium uppercase tracking-wider text-slate-500 text-right">Giá trị</TableHead>
                                                <TableHead className="text-[11px] font-medium uppercase tracking-wider text-slate-500">Người lập</TableHead>
                                                <TableHead className="text-[11px] font-medium uppercase tracking-wider text-slate-500">Người duyệt</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {loading ? (
                                                <TableRow>
                                                    <TableCell colSpan={7} className="text-center py-20">
                                                        <div className="flex flex-col items-center gap-3">
                                                            <Loader2 className="animate-spin h-8 w-8 text-primary/30" />
                                                            <p className="text-xs text-slate-400 font-medium">Đang tải danh sách PYC...</p>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ) : filteredPYCs.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={7} className="h-64 text-center">
                                                        <div className="flex flex-col items-center justify-center gap-2 opacity-30">
                                                            <FileText className="h-12 w-12" />
                                                            <p className="text-sm font-medium">Không tìm thấy PYC phù hợp</p>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                filteredPYCs.map((pyc: any) => (
                                                    <TableRow
                                                        key={pyc.request_id}
                                                        className={cn(
                                                            "hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors cursor-pointer border-slate-50",
                                                            selectedPYCIds.includes(pyc.request_id) && "bg-primary/[0.02]"
                                                        )}
                                                        onClick={() => {
                                                            const exists = selectedPYCIds.includes(pyc.request_id)
                                                            if (exists) {
                                                                setSelectedPYCIds(selectedPYCIds.filter(id => id !== pyc.request_id))
                                                            } else {
                                                                setSelectedPYCIds([...selectedPYCIds, pyc.request_id])
                                                            }
                                                        }}
                                                    >
                                                        <TableCell className="text-center">
                                                            <Checkbox
                                                                checked={selectedPYCIds.includes(pyc.request_id)}
                                                                className="rounded-md border-slate-300"
                                                            />
                                                        </TableCell>
                                                        <TableCell className="font-mono text-xs font-semibold text-primary tracking-tight">{pyc.request_id}</TableCell>
                                                        <TableCell className="text-[12px] font-medium text-slate-600 truncate max-w-[150px]" title={pyc.projects?.project_name}>
                                                            {pyc.projects?.project_name || "-"}
                                                        </TableCell>
                                                        <TableCell className="text-[13px] font-medium text-slate-900 dark:text-slate-100">{pyc.title}</TableCell>
                                                        <TableCell className="text-right font-mono text-[13px] font-semibold text-slate-800 dark:text-slate-200">
                                                            {new Intl.NumberFormat('vi-VN').format(pyc.total_amount)}
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex items-center gap-2">
                                                                <Avatar className="h-8 w-8 border-2 border-slate-50">
                                                                    <AvatarImage src={pyc.author?.avatar_url} />
                                                                    <AvatarFallback className="bg-primary/5 text-primary text-[10px] font-bold uppercase">
                                                                        {pyc.author?.full_name?.substring(0, 2) || pyc.created_by?.substring(0, 2)}
                                                                    </AvatarFallback>
                                                                </Avatar>
                                                                <div className="flex flex-col gap-0.5">
                                                                    <div className="text-[12px] font-medium text-slate-800 dark:text-slate-200 whitespace-nowrap leading-none mb-0.5">{pyc.author?.full_name || pyc.created_by}</div>
                                                                    <div className="text-[10px] text-slate-400 font-medium">{new Date(pyc.created_at).toLocaleDateString('vi-VN')}</div>
                                                                </div>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            {(() => {
                                                                const approver = personnel.find(u => u.email === pyc.approved_by)
                                                                return (
                                                                    <div className="flex items-center gap-2">
                                                                        <Avatar className="h-8 w-8 border-2 border-slate-50">
                                                                            <AvatarImage src={approver?.avatar_url} />
                                                                            <AvatarFallback className="bg-primary/5 text-primary text-[10px] font-bold uppercase">
                                                                                {approver?.full_name?.substring(0, 2) || pyc.approved_by?.substring(0, 2) || '?'}
                                                                            </AvatarFallback>
                                                                        </Avatar>
                                                                        <div className="flex flex-col gap-0.5">
                                                                            <div className="text-[12px] font-medium text-slate-800 dark:text-slate-200 whitespace-nowrap leading-none mb-0.5">
                                                                                {approver?.full_name || pyc.approved_by}
                                                                            </div>
                                                                            <div className="text-[10px] text-slate-400 font-medium">
                                                                                {pyc.approved_at ? new Date(pyc.approved_at).toLocaleDateString('vi-VN') : '-'}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                )
                                                            })()}
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
                            <div className="flex items-center justify-between">
                                <h4 className="text-sm font-semibold flex items-center gap-2 text-slate-700 dark:text-slate-300">
                                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                    Bước 2: Chọn vật tư / dịch vụ cần thanh toán
                                </h4>
                                <div className="text-[11px] font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full border border-slate-200/50">
                                    Đã chọn: <span className="text-primary font-bold">{selectedItems.length}</span> hạng mục
                                </div>
                            </div>
                            <div className="border border-slate-200/60 dark:border-slate-800 rounded-[1.5rem] overflow-hidden shadow-sm bg-white dark:bg-slate-950">
                                <div className="max-h-[350px] overflow-y-auto">
                                    <Table>
                                        <TableHeader className="bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur sticky top-0 z-10">
                                            <TableRow className="hover:bg-transparent border-slate-100">
                                                <TableHead className="w-[50px] text-center">
                                                    <Checkbox
                                                        checked={availableItems.length > 0 && selectedItems.length === availableItems.length}
                                                        onCheckedChange={(checked) => {
                                                            setSelectedItems(checked ? [...availableItems] : [])
                                                        }}
                                                        className="rounded-md border-slate-300"
                                                    />
                                                </TableHead>
                                                <TableHead className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Vật tư / Nội dung</TableHead>
                                                <TableHead className="text-[11px] font-bold uppercase tracking-wider text-slate-500 text-center">Đơn vị</TableHead>
                                                <TableHead className="text-[11px] font-bold uppercase tracking-wider text-slate-500 text-right">Số lượng</TableHead>
                                                <TableHead className="text-[11px] font-bold uppercase tracking-wider text-slate-500 text-right">Đơn giá</TableHead>
                                                <TableHead className="text-[11px] font-bold uppercase tracking-wider text-slate-500 text-right">Thành tiền</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {availableItems.map((item) => {
                                                const isSelected = !!selectedItems.find(i => i.id === item.id)
                                                return (
                                                    <TableRow
                                                        key={item.id}
                                                        className={cn(
                                                            "cursor-pointer transition-colors border-slate-100/50 dark:border-slate-800/50",
                                                            isSelected ? "bg-primary/[0.02] hover:bg-primary/[0.04]" : "hover:bg-slate-50/50"
                                                        )}
                                                        onClick={() => {
                                                            setSelectedItems(prev => prev.find(i => i.id === item.id) ? prev.filter(i => i.id !== item.id) : [...prev, item])
                                                        }}
                                                    >
                                                        <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
                                                            <Checkbox
                                                                checked={isSelected}
                                                                onCheckedChange={() => {
                                                                    setSelectedItems(prev => prev.find(i => i.id === item.id) ? prev.filter(i => i.id !== item.id) : [...prev, item])
                                                                }}
                                                                className="rounded-md border-slate-300 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                                            />
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="font-semibold text-[13px] text-slate-900 dark:text-slate-100 leading-tight">{item.item_name}</div>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <span className="text-[10px] text-primary font-mono bg-primary/5 px-1.5 py-0.5 rounded uppercase tracking-tighter">{item.pyc_request_id}</span>
                                                                {item.material_code && <span className="text-[10px] text-slate-400 font-mono">#{item.material_code}</span>}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="text-center text-xs text-slate-600 font-medium">{item.unit}</TableCell>
                                                        <TableCell className="text-right p-2" onClick={(e) => e.stopPropagation()}>
                                                            <Input
                                                                type="text"
                                                                value={formatNumber(isSelected ? selectedItems.find(i => i.id === item.id)?.quantity : item.quantity)}
                                                                onChange={(e) => handleItemChange(item.id, 'quantity', e.target.value)}
                                                                className="h-9 text-right font-mono text-[13px] w-28 ml-auto border-slate-200 focus:ring-primary/20 rounded-lg bg-white font-semibold"
                                                                disabled={!isSelected}
                                                            />
                                                        </TableCell>
                                                        <TableCell className="text-right p-2" onClick={(e) => e.stopPropagation()}>
                                                            <Input
                                                                type="text"
                                                                value={formatNumber(isSelected ? selectedItems.find(i => i.id === item.id)?.unit_price : item.unit_price)}
                                                                onChange={(e) => handleItemChange(item.id, 'unit_price', e.target.value)}
                                                                className="h-9 text-right font-mono text-[13px] w-32 ml-auto border-slate-200 focus:ring-primary/20 rounded-lg bg-white font-semibold"
                                                                disabled={!isSelected}
                                                            />
                                                        </TableCell>
                                                        <TableCell className="text-right font-mono text-xs font-bold text-slate-900">
                                                            {new Intl.NumberFormat('vi-VN').format(
                                                                isSelected
                                                                    ? (selectedItems.find(i => i.id === item.id)?.calculated_gross || 0)
                                                                    : (Number(item.quantity) * Number(item.unit_price))
                                                            )}
                                                        </TableCell>
                                                    </TableRow>
                                                )
                                            })}
                                        </TableBody>
                                    </Table>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {/* Unified Grid Layout for balanced rows */}
                            <div className="grid grid-cols-2 gap-x-12 gap-y-6">
                                {/* Header Row */}
                                <h4 className="text-[13px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                                    <FileText className="h-4 w-4" />
                                    Thông tin chung
                                </h4>
                                <h4 className="text-[13px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                                    <Truck className="h-4 w-4" />
                                    Phân loại chi phí & Hợp đồng
                                </h4>

                                {/* Row 1: ID vs Expense Type */}
                                <div className="grid gap-2">
                                    <Label className="text-[11px] font-bold text-slate-700 ml-1 uppercase tracking-wider">Mã đề nghị thanh toán *</Label>
                                    <Input
                                        value={headerData.payment_request_id}
                                        onChange={(e) => setHeaderData({ ...headerData, payment_request_id: e.target.value })}
                                        className="h-11 rounded-lg border-slate-200 focus:ring-primary/20 transition-all font-mono text-[13px] text-slate-700 bg-white"
                                        required
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label className="text-[11px] font-bold text-slate-700 ml-1 uppercase tracking-wider">Tên chi phí (Loại chi phí) *</Label>
                                    <Select
                                        value={headerData.expense_type_name}
                                        onValueChange={(val) => {
                                            const category = expenseCategories.find(c => c.type_name === val)
                                            setHeaderData({
                                                ...headerData,
                                                expense_type_name: val,
                                                expense_group_name: category?.group_name || ''
                                            })
                                        }}
                                    >
                                        <SelectTrigger className="w-full h-11 rounded-lg border-slate-200 focus:ring-primary/20 transition-all text-[13px] font-medium text-slate-800 bg-white hover:bg-slate-50 shadow-sm px-4">
                                            <SelectValue placeholder="Chọn loại chi phí hệ thống..." />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-lg border-slate-100 shadow-xl max-h-[300px]">
                                            {Array.from(new Set(expenseCategories.map(c => c.type_name))).map(typeName => (
                                                <SelectItem key={typeName} value={typeName} className="text-[13px] py-2.5">
                                                    {typeName}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Row 2: Date/Method vs Expense Group */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label className="text-[11px] font-bold text-slate-700 ml-1 uppercase tracking-wider">Ngày đề nghị *</Label>
                                        <Input
                                            type="date"
                                            value={headerData.request_date}
                                            onChange={(e) => setHeaderData({ ...headerData, request_date: e.target.value })}
                                            className="h-11 rounded-lg border-slate-200 focus:ring-primary/20 transition-all text-[13px] font-medium text-slate-700 bg-white"
                                            required
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label className="text-[11px] font-bold text-slate-700 ml-1 uppercase tracking-wider">Hình thức *</Label>
                                        <Select
                                            value={headerData.payment_method}
                                            onValueChange={(val) => setHeaderData({ ...headerData, payment_method: val })}
                                        >
                                            <SelectTrigger className="w-full h-11 rounded-lg border-slate-200 focus:ring-primary/20 transition-all text-[13px] font-medium text-slate-800 bg-white hover:bg-slate-50 shadow-sm px-4">
                                                <SelectValue placeholder="Chọn..." />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-lg border-slate-100 shadow-xl">
                                                <SelectItem value="Chuyển khoản" className="text-[13px]">Chuyển khoản</SelectItem>
                                                <SelectItem value="Tiền mặt" className="text-[13px]">Tiền mặt</SelectItem>
                                                <SelectItem value="Tạm ứng" className="text-[13px]">Tạm ứng</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="grid gap-2">
                                    <Label className="text-[11px] font-bold text-slate-700 ml-1 uppercase tracking-wider">Nhóm chi phí</Label>
                                    <div className="relative">
                                        <Input
                                            placeholder="Tự động theo loại chi phí..."
                                            value={headerData.expense_group_name}
                                            readOnly
                                            className="h-11 rounded-lg border-slate-200 bg-slate-50/50 text-[13px] font-medium text-slate-500 cursor-not-allowed"
                                        />
                                    </div>
                                </div>

                                {/* Row 3: Supplier vs Contract Type */}
                                <div className="grid gap-2">
                                    <Label className="text-[11px] font-bold text-slate-700 ml-1 uppercase tracking-wider">Nhà cung cấp / Đối tác *</Label>
                                    <div className="flex items-center w-full gap-2 overflow-hidden">
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    role="combobox"
                                                    className={cn(
                                                        "h-11 flex-1 justify-between rounded-lg border-slate-200 font-medium px-4 text-[13px] text-slate-800 bg-white hover:bg-slate-50 shadow-sm min-w-0 overflow-hidden",
                                                        !headerData.supplier_name && "text-slate-400 font-normal"
                                                    )}
                                                >
                                                    <span className="truncate mr-2">
                                                        {headerData.supplier_name
                                                            ? suppliers.find((s) => s.supplier_name === headerData.supplier_name)?.supplier_name || headerData.supplier_name
                                                            : "Chọn nhà cung cấp..."}
                                                    </span>
                                                    <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-[400px] p-0 rounded-lg" align="start">
                                                <Command>
                                                    <CommandInput placeholder="Tìm nhà cung cấp..." />
                                                    <CommandList>
                                                        <CommandEmpty>Không tìm thấy.</CommandEmpty>
                                                        <CommandGroup>
                                                            {suppliers.map((s) => (
                                                                <CommandItem
                                                                    key={s.id}
                                                                    value={s.supplier_name}
                                                                    onSelect={() => {
                                                                        setHeaderData({
                                                                            ...headerData,
                                                                            supplier_name: s.supplier_name,
                                                                            supplier_tax_code: s.tax_code || ''
                                                                        })
                                                                    }}
                                                                >
                                                                    <Check
                                                                        className={cn(
                                                                            "mr-2 h-4 w-4",
                                                                            headerData.supplier_name === s.supplier_name ? "opacity-100" : "opacity-0"
                                                                        )}
                                                                    />
                                                                    <div className="flex flex-col">
                                                                        <span className="font-medium text-[13px]">{s.supplier_name}</span>
                                                                        {s.tax_code && <span className="text-[10px] text-slate-400 font-mono">MST: {s.tax_code}</span>}
                                                                    </div>
                                                                </CommandItem>
                                                            ))}
                                                        </CommandGroup>
                                                    </CommandList>
                                                </Command>
                                            </PopoverContent>
                                        </Popover>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="icon"
                                            className="h-11 w-11 rounded-lg bg-primary/5 text-primary border-primary/20 hover:bg-primary/10 shrink-0"
                                            onClick={() => setIsAddingSupplier(true)}
                                        >
                                            <Plus className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                                <div className="grid gap-2">
                                    <Label className="text-[11px] font-bold text-slate-700 ml-1 uppercase tracking-wider">Loại hợp đồng *</Label>
                                    <Select
                                        value={headerData.contract_type_code}
                                        onValueChange={(val) => setHeaderData({ ...headerData, contract_type_code: val })}
                                    >
                                        <SelectTrigger className="w-full h-11 rounded-lg border-slate-200 focus:ring-primary/20 transition-all text-[13px] font-medium text-slate-800 bg-white hover:bg-slate-50 shadow-sm px-4">
                                            <SelectValue placeholder="Chọn loại hợp đồng" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-lg border-slate-100 shadow-xl">
                                            <SelectItem value="HDTP" className="text-[13px]">Có hợp đồng Thầu phụ</SelectItem>
                                            <SelectItem value="HDCC" className="text-[13px]">Có hợp đồng Cung cấp</SelectItem>
                                            <SelectItem value="PO" className="text-[13px]">Đơn đặt hàng (PO)</SelectItem>
                                            <SelectItem value="NONE" className="text-[13px]">Không có hợp đồng</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Row 4: DocNum/Tax vs Summary Box (Span starts) */}
                                <div className="grid gap-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label className="text-[11px] font-bold text-slate-700 ml-1 uppercase tracking-wider">Số chứng từ (DNTT) *</Label>
                                            <Input
                                                placeholder="VD: DNTT-001..."
                                                value={headerData.document_number}
                                                onChange={(e) => setHeaderData({ ...headerData, document_number: e.target.value })}
                                                className="h-11 rounded-lg border-slate-200 focus:ring-primary/20 transition-all text-[13px] font-medium text-slate-700 bg-white"
                                                required
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label className="text-[11px] font-bold text-slate-700 ml-1 uppercase tracking-wider">MST NCC</Label>
                                            <Input
                                                placeholder="Tự động..."
                                                value={headerData.supplier_tax_code}
                                                onChange={(e) => setHeaderData({ ...headerData, supplier_tax_code: e.target.value })}
                                                className="h-11 rounded-lg border-slate-200 focus:ring-primary/20 transition-all text-[13px] font-medium text-slate-700 bg-white font-mono"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label className="text-[11px] font-bold text-slate-700 ml-1 uppercase tracking-wider">Đối tượng chi trả *</Label>
                                            <Select
                                                value={headerData.payer_type}
                                                onValueChange={(val) => setHeaderData({ ...headerData, payer_type: val })}
                                            >
                                                <SelectTrigger className="w-full h-11 rounded-lg border-slate-200 focus:ring-primary/20 transition-all text-[13px] font-medium text-slate-800 bg-white hover:bg-slate-50 shadow-sm px-4">
                                                    <SelectValue placeholder="Chọn..." />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-lg border-slate-100 shadow-xl">
                                                    <SelectItem value="BĐH DA" className="text-[13px]">BĐH DA (Dự án)</SelectItem>
                                                    <SelectItem value="VPC" className="text-[13px]">VPC (Văn phòng)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="grid gap-2">
                                            <Label className="text-[11px] font-bold text-slate-700 ml-1 uppercase tracking-wider">Phương thức TT *</Label>
                                            <Select
                                                value={headerData.payment_type_code}
                                                onValueChange={(val) => setHeaderData({ ...headerData, payment_type_code: val, payment_method: val === 'CK' ? 'Chuyển khoản' : 'Tiền mặt' })}
                                            >
                                                <SelectTrigger className="w-full h-11 rounded-lg border-slate-200 focus:ring-primary/20 transition-all text-[13px] font-medium text-slate-800 bg-white hover:bg-slate-50 shadow-sm px-4">
                                                    <SelectValue placeholder="Chọn..." />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-lg border-slate-100 shadow-xl">
                                                    <SelectItem value="CK" className="text-[13px]">Chuyển khoản (CK)</SelectItem>
                                                    <SelectItem value="TM" className="text-[13px]">Tiền mặt (TM)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label className="text-[11px] font-bold text-slate-700 ml-1 uppercase tracking-wider">Nội dung thanh toán *</Label>
                                        <Input
                                            placeholder="VD: Thanh toán đợt 1 cung cấp vật tư thép..."
                                            value={headerData.payment_reason}
                                            onChange={(e) => setHeaderData({ ...headerData, payment_reason: e.target.value })}
                                            className="h-11 rounded-lg border-slate-200 focus:ring-primary/20 transition-all text-[13px] font-medium text-slate-700 bg-white"
                                            required
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label className="text-[11px] font-bold text-slate-700 ml-1 uppercase tracking-wider">Ghi chú chung</Label>
                                        <Input
                                            placeholder="Thông tin bổ sung..."
                                            value={headerData.notes}
                                            onChange={(e) => setHeaderData({ ...headerData, notes: e.target.value })}
                                            className="h-11 rounded-lg border-slate-200 focus:ring-primary/20 transition-all text-[13px] text-slate-700 bg-white italic"
                                        />
                                    </div>
                                </div>

                                {/* Right Side: Summary Box spanning multiple left-side rows */}
                                <div className="h-full flex flex-col justify-start">
                                    <div className="p-8 bg-primary/[0.02] dark:bg-primary/[0.01] rounded-2xl border border-primary/10 shadow-sm relative overflow-hidden group min-h-[300px] flex flex-col justify-center">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl transition-all group-hover:bg-primary/10" />
                                        <div className="space-y-6 relative z-10">
                                            <div className="flex justify-between items-center text-[13px] text-slate-500">
                                                <span className="flex items-center gap-2">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                                                    Tiền hàng (Net):
                                                </span>
                                                <span className="font-mono font-semibold">{new Intl.NumberFormat('vi-VN').format(totals.net)}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-[13px] text-slate-500">
                                                <span className="flex items-center gap-2">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                                                    Thuế GTGT (VAT):
                                                </span>
                                                <span className="font-mono font-semibold">{new Intl.NumberFormat('vi-VN').format(totals.vat)}</span>
                                            </div>
                                            <div className="pt-6 border-t border-primary/10 flex justify-between items-end">
                                                <div>
                                                    <span className="text-[12px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Tổng thanh toán</span>
                                                    <span className="text-[11px] text-slate-400 font-normal">Đã bao gồm thuế GTGT</span>
                                                </div>
                                                <span className="text-3xl font-black text-primary tracking-tighter">
                                                    {new Intl.NumberFormat('vi-VN').format(totals.gross)}
                                                    <span className="text-[14px] ml-1 font-bold opacity-70">VNĐ</span>
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                                <AttachmentList
                                    tableName="payment_requests"
                                    refId={headerData.payment_request_id}
                                    title="Tài liệu đính kèm (Chứng từ, Hóa đơn...)"
                                />
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter className="p-6 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between shrink-0">
                    <Button variant="ghost" onClick={() => onOpenChange(false)} className="h-10 px-6 rounded-lg hover:bg-slate-100 transition-colors font-medium">
                        Đóng
                    </Button>
                    <div className="flex gap-2">
                        {step > 1 && (
                            <Button variant="outline" onClick={handleBack} disabled={loading} className="h-10 px-6 rounded-lg border-slate-200">
                                <ChevronLeft className="h-4 w-4 mr-2" />
                                Quay lại
                            </Button>
                        )}
                        {step < 3 ? (
                            <Button onClick={handleNext} disabled={loading} className="h-10 px-8 rounded-lg shadow-lg shadow-primary/20">
                                Tiếp tục
                                <ChevronRight className="h-4 w-4 ml-2" />
                            </Button>
                        ) : (
                            <Button onClick={handleSubmit} disabled={loading} className="h-10 px-10 rounded-lg shadow-lg shadow-primary/30 bg-primary hover:bg-primary/90 font-semibold">
                                {loading && <Loader2 className="animate-spin h-4 w-4 mr-2" />}
                                Gửi yêu cầu thanh toán
                            </Button>
                        )}
                    </div>
                </DialogFooter>
            </DialogContent>

            {/* Quick Add Supplier Dialog */}
            <Dialog open={isAddingSupplier} onOpenChange={setIsAddingSupplier}>
                <DialogContent className="sm:max-w-[425px] rounded-3xl">
                    <DialogHeader>
                        <DialogTitle>Thêm Nhà cung cấp mới</DialogTitle>
                        <DialogDescription>
                            Đăng ký nhanh đối tác mới cho dự án này.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label>Tên đối tác *</Label>
                            <Input
                                value={newSupplier.supplier_name}
                                onChange={(e) => setNewSupplier({ ...newSupplier, supplier_name: e.target.value })}
                                placeholder="Nhập tên đầy đủ..."
                                className="h-11 rounded-lg border-slate-200 text-[13px] font-medium text-slate-700 bg-white"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label>Mã số thuế</Label>
                            <Input
                                value={newSupplier.tax_code}
                                onChange={(e) => setNewSupplier({ ...newSupplier, tax_code: e.target.value })}
                                placeholder="Nhập MST (nếu có)..."
                                className="h-11 rounded-lg border-slate-200 text-[13px] font-medium text-slate-700 bg-white font-mono"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsAddingSupplier(false)}>Hủy</Button>
                        <Button onClick={handleQuickAddSupplier} disabled={loading} className="rounded-lg">
                            {loading && <Loader2 className="animate-spin h-4 w-4 mr-2" />}
                            Lưu thông tin
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Dialog>
    )
}
