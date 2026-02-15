# Hướng Dẫn Thêm Tabs vào PYC Dialog

## Mục tiêu
Chia dialog PYC thành 2 tabs:
- **Tab 1 - Thông tin cơ bản**: Các trường header
- **Tab 2 - Chi tiết phiếu**: Bảng chi tiết hạng mục

## Bước 1: Import đã hoàn thành ✅

Đã thêm import Tabs vào file `pyc-dialog.tsx`:
```tsx
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '@/components/ui/tabs'
```

## Bước 2: Thay thế nội dung trong StandardDialogLayout

Tìm dòng `<div className="flex flex-col gap-6">` (khoảng dòng 186) và thay thế toàn bộ nội dung bên trong `<StandardDialogLayout>` bằng cấu trúc tabs sau:

```tsx
<Tabs defaultValue="basic" className="w-full">
    <TabsList className="grid w-full grid-cols-2 mb-4">
        <TabsTrigger value="basic">Thông tin cơ bản</TabsTrigger>
        <TabsTrigger value="details">Chi tiết phiếu</TabsTrigger>
    </TabsList>

    {/* TAB 1: THÔNG TIN CƠ BẢN */}
    <TabsContent value="basic" className="space-y-4">
        {/* Header Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="grid gap-2">
                <Label htmlFor="request_id">Mã phiếu</Label>
                <Input id="request_id" value={headerData.request_id} readOnly className="bg-muted font-mono text-xs cursor-not-allowed" />
            </div>
            <div className="grid gap-2 md:col-span-2">
                <Label htmlFor="title">Tiêu đề phiếu <span className="text-destructive">*</span></Label>
                <Input
                    id="title"
                    value={headerData.title}
                    onChange={e => setHeaderData({ ...headerData, title: e.target.value })}
                    placeholder="VD: Yêu cầu vật tư thi công tầng 5..."
                    required
                />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="project_id">Dự án</Label>
                <Select value={headerData.project_id || "global"} onValueChange={v => setHeaderData({ ...headerData, project_id: v === "global" ? "" : v })}>
                    <SelectTrigger id="project_id">
                        <SelectValue placeholder="Chọn dự án" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="global">Dùng chung (Toàn bộ)</SelectItem>
                        {projects.map(p => (
                            <SelectItem key={p.project_id} value={p.project_id}>{p.project_name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="grid gap-2">
                <Label htmlFor="request_type">Loại yêu cầu</Label>
                <Select value={headerData.request_type!} onValueChange={v => setHeaderData({ ...headerData, request_type: v as string })}>
                    <SelectTrigger id="request_type">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {LOAI_PHIEU.map(t => (
                            <SelectItem key={t} value={t}>{t}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="grid gap-2">
                <Label htmlFor="priority">Độ ưu tiên</Label>
                <Select value={headerData.priority!} onValueChange={v => setHeaderData({ ...headerData, priority: v as string })}>
                    <SelectTrigger id="priority">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {MUC_DO_UU_TIEN.map(p => (
                            <SelectItem key={p} value={p}>{p}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="grid gap-2">
                <Label htmlFor="vat_default">VAT mặc định</Label>
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
                    <SelectTrigger id="vat_default">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {VAT_OPTIONS.map(opt => (
                            <SelectItem key={opt.display} value={opt.display}>{opt.display}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>

        <div className="grid gap-2">
            <Label htmlFor="notes">Ghi chú phiếu</Label>
            <Textarea
                id="notes"
                value={headerData.notes}
                onChange={e => setHeaderData({ ...headerData, notes: e.target.value })}
                placeholder="Lý do yêu cầu chi tiết..."
                className="min-h-[120px]"
            />
        </div>
    </TabsContent>

    {/* TAB 2: CHI TIẾT PHIẾU */}
    <TabsContent value="details" className="space-y-4">
        {/* Items Section - CHỈ CÓ BẢNG */}
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-muted-foreground" />
                    <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Danh sách hạng mục</h3>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={handleAddDetail} className="h-9">
                    <Plus className="h-3.5 w-3.5 mr-2" />
                    Thêm dòng mới
                </Button>
            </div>

            <div className="border border-border/50 rounded-lg overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/50 hover:bg-muted/50 text-[10px]">
                            <TableHead className="w-[28%] font-bold uppercase py-2">Hạng mục</TableHead>
                            <TableHead className="w-[10%] font-bold uppercase py-2">ĐVT</TableHead>
                            <TableHead className="w-[10%] font-bold uppercase text-right py-2">SL</TableHead>
                            <TableHead className="w-[12%] font-bold uppercase text-right py-2">Đơn giá</TableHead>
                            <TableHead className="w-[14%] font-bold uppercase py-2">VAT</TableHead>
                            <TableHead className="w-[14%] font-bold uppercase text-right py-2">Thành tiền</TableHead>
                            <TableHead className="w-[6%] py-2"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {details.map((detail, index) => (
                            <TableRow key={index} className="hover:bg-muted/30 transition-colors">
                                <TableCell className="p-1">
                                    <Input
                                        value={detail.item_name}
                                        onChange={e => handleDetailChange(index, 'item_name', e.target.value)}
                                        placeholder="Sắt thép, Xi măng..."
                                        className="h-8 border-none bg-transparent focus-visible:ring-0 text-sm"
                                    />
                                </TableCell>
                                <TableCell className="p-1">
                                    <Input
                                        value={detail.unit || ''}
                                        onChange={e => handleDetailChange(index, 'unit', e.target.value)}
                                        placeholder="Kg"
                                        className="h-8 border-none bg-transparent focus-visible:ring-0 text-center text-xs"
                                    />
                                </TableCell>
                                <TableCell className="p-1">
                                    <Input
                                        type="number"
                                        value={detail.quantity}
                                        onChange={e => handleDetailChange(index, 'quantity', e.target.value)}
                                        className="h-8 border-none bg-transparent focus-visible:ring-0 text-right font-mono text-xs"
                                    />
                                </TableCell>
                                <TableCell className="p-1">
                                    <Input
                                        type="number"
                                        value={detail.unit_price}
                                        onChange={e => handleDetailChange(index, 'unit_price', e.target.value)}
                                        className="h-8 border-none bg-transparent focus-visible:ring-0 text-right font-mono text-xs"
                                    />
                                </TableCell>
                                <TableCell className="p-1">
                                    <Select 
                                        value={detail.vat_display || DEFAULT_VAT_OPTION.display} 
                                        onValueChange={v => {
                                            const selectedVAT = VAT_OPTIONS.find(opt => opt.display === v)
                                            if (selectedVAT) {
                                                handleDetailChange(index, 'vat_display', selectedVAT.display)
                                                handleDetailChange(index, 'vat_value', selectedVAT.value)
                                            }
                                        }}
                                    >
                                        <SelectTrigger className="h-8 border-none bg-transparent focus:ring-0 text-xs">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {VAT_OPTIONS.map(opt => (
                                                <SelectItem key={opt.display} value={opt.display}>{opt.display}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </TableCell>
                                <TableCell className="p-1 text-right">
                                    <span className="text-xs font-bold text-muted-foreground mr-2">
                                        {new Intl.NumberFormat('vi-VN').format(Number(detail.quantity || 0) * Number(detail.unit_price || 0))}
                                    </span>
                                </TableCell>
                                <TableCell className="p-1 text-center">
                                    <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveDetail(index)} className="h-7 w-7 text-muted-foreground hover:text-destructive">
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Tổng tiền */}
            <div className="flex justify-end">
                <div className="w-full md:w-[280px] bg-primary/5 rounded-lg p-5 flex flex-col justify-center gap-1 border border-primary/10">
                    <div className="flex items-center gap-2 text-primary/70">
                        <Calculator className="h-4 w-4" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Tổng dự kiến</span>
                    </div>
                    <div className="text-xl font-bold tracking-tight text-primary">
                        {new Intl.NumberFormat('vi-VN').format(calculateTotal())}
                        <span className="text-[10px] ml-2 font-normal opacity-70 uppercase">VNĐ</span>
                    </div>
                    <div className="flex items-center gap-2 mt-2 text-[10px] text-muted-foreground">
                        <Info className="h-3 w-3" />
                        <span>Giá dự kiến (chưa thuế)</span>
                    </div>
                </div>
            </div>
        </div>
    </TabsContent>
</Tabs>
```

## Lưu ý

- Phần "Ghi chú phiếu" đã được di chuyển vào Tab 1 (Thông tin cơ bản)
- Phần "Tổng dự kiến" đã được di chuyển vào Tab 2 (Chi tiết phiếu)
- Tab 2 chỉ chứa bảng chi tiết và tổng tiền, không có các trường header
- Đã thêm dropdown VAT mặc định vào Tab 1

## Kết quả

Sau khi thay đổi, dialog sẽ có 2 tabs:
1. **Thông tin cơ bản**: Mã phiếu, Tiêu đề, Dự án, Loại yêu cầu, Độ ưu tiên, VAT mặc định, Ghi chú
2. **Chi tiết phiếu**: Bảng hạng mục với VAT cho từng dòng và tổng tiền
