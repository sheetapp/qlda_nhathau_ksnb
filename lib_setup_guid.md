# 📚 Hướng Dẫn Cài Đặt Thư Viện - KSNB_XD Project

**Ngày tạo:** 25/02/2026  
**Tên dự án:** KSNB_XD (Next.js + Supabase)  
**Version Node:** 

---

## 📋 Tóm Tắt

Dự án này sử dụng **Next.js 16.1.6** với các thư viện UI, ORM, và utilities hiện đại. Tất cả dependencies đã được cài đặt trong `node_modules`.

---

## 📦 Danh Sách Thư Viện (24 Dependencies)

### 🔧 Core Framework
| Package | Version | Mục đích |
|---------|---------|---------|
| `next` | 16.1.6 | Full-stack React framework |
| `react` | 19.2.3 | React library |
| `react-dom` | 19.2.3 | React DOM rendering |

### 🎨 UI Components & Styling
| Package | Version | Mục đích |
|---------|---------|---------|
| `@radix-ui/react-avatar` | 1.1.11 | Avatar component |
| `@radix-ui/react-checkbox` | 1.3.3 | Checkbox component |
| `@radix-ui/react-dialog` | 1.1.15 | Dialog/Modal component |
| `@radix-ui/react-radio-group` | 1.3.8 | Radio group component |
| `@radix-ui/react-select` | 2.2.6 | Select dropdown component |
| `@radix-ui/react-separator` | 1.1.8 | Separator component |
| `@radix-ui/react-slot` | 1.2.4 | Slot component utility |
| `@radix-ui/react-tabs` | 1.1.13 | Tabs component |
| `radix-ui` | 1.4.3 | Complete Radix UI collection |
| `class-variance-authority` | 0.7.1 | CSS class generation |
| `clsx` | 2.1.1 | Conditional className utility |
| `tailwind-merge` | 3.4.0 | Tailwind CSS class merging |

### 🗄️ Database & ORM
| Package | Version | Mục đích |
|---------|---------|---------|
| `drizzle-orm` | 0.45.1 | Type-safe ORM |
| `postgres` | 3.4.8 | PostgreSQL driver |
| `@supabase/supabase-js` | 2.95.3 | Supabase client library |
| `@supabase/ssr` | 0.8.0 | Supabase SSR support |

### 📝 Forms & Validation
| Package | Version | Mục đích |
|---------|---------|---------|
| `react-hook-form` | 7.71.1 | Form state management |
| `@hookform/resolvers` | 5.2.2 | Form validation resolvers |
| `zod` | 4.3.6 | Schema validation |

### 🛠️ Utilities & Others
| Package | Version | Mục đích |
|---------|---------|---------|
| `date-fns` | 4.1.0 | Date formatting & manipulation |
| `cmdk` | 1.1.1 | Command menu component |
| `lucide-react` | 0.563.0 | Icon library |
| `sonner` | 2.0.7 | Toast notification library |
| `xlsx` | 0.18.5 | Excel file handling |
| `next-themes` | 0.4.6 | Dark mode & theme support |

---

## 📦 DevDependencies (7 packages)

| Package | Version | Mục đích |
|---------|---------|---------|
| `@tailwindcss/postcss` | 4 | Tailwind CSS processor |
| `tailwindcss` | 4 | Utility-first CSS framework |
| `@types/react` | 19 | TypeScript types for React |
| `@types/react-dom` | 19 | TypeScript types for React DOM |
| `@types/node` | 20 | TypeScript types for Node.js |
| `drizzle-kit` | 0.31.9 | Drizzle ORM CLI tool |
| `eslint` | 9 | Code linting |
| `eslint-config-next` | 16.1.6 | ESLint config for Next.js |
| `typescript` | 5 | TypeScript compiler |
| `shadcn` | 3.8.4 | Component library CLI |
| `tw-animate-css` | 1.4.0 | Tailwind animations |

---

## ✅ Trạng Thái Cài Đặt

### Status: ✅ COMPLETE
- **Total Dependencies:** 24 (production) + 7 (development)
- **Installation Status:** All packages installed successfully
- **Last Verified:** 25/02/2026

> Tất cả các thư viện đã được cài đặt đầy đủ trong `node_modules/`

---

## 🚀 Các Lệnh Chính

```bash
# Cài đặt dependencies (nếu cần)
npm install

# Chạy development server
npm run dev

# Build cho production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

---

## 📝 Ghi Chú Quan Trọng

1. **Database:** Dự án sử dụng Supabase (PostgreSQL) + Drizzle ORM
2. **Styling:** Tailwind CSS v4 + Radix UI components
3. **Form Handling:** React Hook Form + Zod validation
4. **Theme:** Hỗ trợ dark mode qua next-themes
5. **Excel Export:** Có hỗ trợ xuất Excel files

---

## 🔗 Liên Kết Nhanh

- [Next.js Documentation](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Radix UI](https://www.radix-ui.com/)
- [Drizzle ORM](https://orm.drizzle.team/)
- [Supabase](https://supabase.com/)
- [React Hook Form](https://react-hook-form.com/)

---

**Prepared by:** GitHub Copilot  
**For Setup:** Copy this project folder and run `npm install` if needed.
