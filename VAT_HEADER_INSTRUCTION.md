## Thêm VAT Dropdown vào Header Form

Để hoàn tất chức năng VAT mặc định, bạn cần thêm dropdown VAT vào phần header form trong file `pyc-dialog.tsx`.

**Vị trí:** Sau phần "Độ ưu tiên" (dòng ~239), thêm đoạn code sau:

```tsx
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
```

**Giải thích:**
- Dropdown này cho phép người dùng chọn VAT mặc định cho toàn bộ phiếu
- Khi thêm dòng mới trong chi tiết, dòng đó sẽ tự động sử dụng VAT từ header
- Mỗi dòng vẫn có thể thay đổi VAT riêng nếu cần
