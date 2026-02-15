/**
 * Cấu hình thông số cho Phiếu Yêu Cầu (PYC)
 * Các thông số này sẽ được load vào hộp thoại PYC
 */

/**
 * Loại phiếu yêu cầu
 * Các loại phiếu có thể được chọn khi tạo PYC
 */
export const LOAI_PHIEU = [
    'Vật tư',
    'Nhân công',
    'Hành chính văn phòng',
    'QS',
    'QC',
    'HSE',
    'Dịch vụ',
    'Thuê máy',
    'Khác'
] as const

/**
 * Mức độ ưu tiên
 * Các mức độ ưu tiên có thể được chọn cho PYC
 */
export const MUC_DO_UU_TIEN = [
    'Thường',
    'Cao',
    'Khẩn cấp'
] as const

/**
 * Hạng mục công việc
 * Các hạng mục có thể được chọn cho công việc
 */
export const TASK_CATEGORIES = [
    'Công trình tạm',
    'Xăng dầu chung cho dự án',
    'Máy thi công chung cho dự án',
    'Huy động và  di dời',
    'Ngoại giao',
    'C3 & C4 WORK',
    'Nhân sự chung cho dự án',
    'FORMWORK',
    'RE-BAR WORK',
    'Khác'
] as const

/**
 * Nhóm tài nguyên
 * Các nhóm tài nguyên có thể được chọn
 */
export const NHOM_TAI_NGUYEN = [
    'Máy móc thiết bị',
    'Vật tư xây dựng',
    'Công cụ dụng cụ',
    'Thiết bị an toàn',
    'Vật tư điện',
    'Vật tư nước',
    'Nhiên liệu',
    'Khác'
] as const

/**
 * Trạng thái phiếu
 * Các trạng thái có thể của phiếu yêu cầu
 */
export const TASK_STATUS = [
    'Chờ thực hiện',
    'Đang thực hiện',
    'Tạm dừng',
    'Hủy',
    'Hoàn tất'
] as const

export const TRANG_THAI_PHIEU = [
    'Chờ duyệt',
    'Đã duyệt',
    'Từ chối',
    'Cần chỉnh sửa'
] as const

/**
 * Thuế giá trị gia tăng (VAT)
 * Mỗi option bao gồm display (hiển thị) và value (giá trị số)
 */
export const VAT_OPTIONS = [
    { display: '5%', value: 0.05 },
    { display: '8%', value: 0.08 },
    { display: '10%', value: 0.1 },
    { display: 'Không chịu thuế', value: 0 },
    { display: 'Khác', value: 0 }
] as const

/**
 * Type definitions cho TypeScript
 */
export type LoaiPhieu = typeof LOAI_PHIEU[number]
export type MucDoUuTien = typeof MUC_DO_UU_TIEN[number]
export type TaskCategory = typeof TASK_CATEGORIES[number]
export type TaskStatus = typeof TASK_STATUS[number]
export type TrangThaiPhieu = typeof TRANG_THAI_PHIEU[number]
export type VATOption = typeof VAT_OPTIONS[number]
export type NhomTaiNguyen = typeof NHOM_TAI_NGUYEN[number]

/**
 * Giá trị mặc định
 */
export const DEFAULT_LOAI_PHIEU: LoaiPhieu = 'Vật tư'
export const DEFAULT_MUC_DO_UU_TIEN: MucDoUuTien = 'Thường'
export const DEFAULT_TRANG_THAI_PHIEU: TrangThaiPhieu = 'Chờ duyệt'
export const DEFAULT_VAT_OPTION: VATOption = VAT_OPTIONS[2] // 10%
