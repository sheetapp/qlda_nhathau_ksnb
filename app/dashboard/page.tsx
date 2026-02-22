import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { FolderKanban, FileText, Wallet, Package, ArrowUpRight, TrendingUp, Clock, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default async function DashboardPage() {
  const supabase = await createClient()

  // Fetch statistics from Supabase
  const [
    { count: projectCount },
    { count: pycCount },
    { count: resourceCount },
  ] = await Promise.all([
    supabase
      .from('projects')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'Đang thực hiện'),
    supabase
      .from('pyc')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'Chờ duyệt'),
    supabase
      .from('resources')
      .select('*', { count: 'exact', head: true }),
  ])

  // Get total payment amount for this month
  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const { data: dnttData } = await supabase
    .from('dntt')
    .select('total_gross')
    .gte('request_date', startOfMonth.toISOString().split('T')[0])

  const totalPayment = dnttData?.reduce((sum, item) => sum + Number(item.total_gross || 0), 0) || 0

  return (
    <div className="p-6 space-y-10">
      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-none shadow-[0_4px_12px_rgba(0,0,0,0.03)] bg-card/40 backdrop-blur-sm rounded-3xl overflow-hidden hover:shadow-xl transition-all duration-300 group">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Dự án active</CardTitle>
            <div className="p-2 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
              <FolderKanban className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tighter">{projectCount || 0}</div>
            <div className="flex items-center text-xs mt-2 text-blue-600 dark:text-blue-400 font-medium bg-blue-500/10 w-fit px-2 py-0.5 rounded-full">
              <TrendingUp className="h-3 w-3 mr-1" />
              +2 trong tuần qua
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-[0_4px_12px_rgba(0,0,0,0.03)] bg-card/40 backdrop-blur-sm rounded-3xl overflow-hidden hover:shadow-xl transition-all duration-300 group">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">PYC chờ duyệt</CardTitle>
            <div className="p-2 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-xl group-hover:bg-amber-600 group-hover:text-white transition-colors duration-300">
              <FileText className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tighter">{pycCount || 0}</div>
            <div className="flex items-center text-xs mt-2 text-amber-600 dark:text-amber-400 font-medium bg-amber-500/10 w-fit px-2 py-0.5 rounded-full">
              <AlertCircle className="h-3 w-3 mr-1" />
              Cần xử lý ngay
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-[0_4px_12px_rgba(0,0,0,0.03)] bg-card/40 backdrop-blur-sm rounded-3xl overflow-hidden hover:shadow-xl transition-all duration-300 group">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Thanh toán tháng</CardTitle>
            <div className="p-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-300">
              <Wallet className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tighter">
              {new Intl.NumberFormat('vi-VN').format(totalPayment)}
            </div>
            <p className="text-xs mt-2 text-muted-foreground">VNĐ đã giải ngân</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-[0_4px_12px_rgba(0,0,0,0.03)] bg-card/40 backdrop-blur-sm rounded-3xl overflow-hidden hover:shadow-xl transition-all duration-300 group">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Tồn kho vật tư</CardTitle>
            <div className="p-2 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300">
              <Package className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tighter">{resourceCount || 0}</div>
            <p className="text-xs mt-2 text-muted-foreground">Danh mục mặt hàng</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Section: Analytics & Activity */}
      <div className="grid gap-8 md:grid-cols-3">
        <Card className="md:col-span-2 border-none shadow-[0_4px_12px_rgba(0,0,0,0.03)] bg-card/40 backdrop-blur-sm rounded-3xl p-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <CardTitle className="text-xl">Diễn biến thanh toán</CardTitle>
              <CardDescription>Biểu đồ giải ngân theo thời gian</CardDescription>
            </div>
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-primary" />
              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Dòng tiền</span>
            </div>
          </div>
          <div className="h-[240px] flex items-end justify-between gap-2 px-2">
            {[40, 60, 45, 70, 85, 55, 90, 65, 50, 75, 80, 100].map((h, i) => (
              <div key={i} className="flex-1 group relative">
                <div
                  style={{ height: `${h}%` }}
                  className="bg-primary/10 group-hover:bg-primary/30 rounded-t-lg transition-all duration-500 delay-[i*50ms]"
                />
                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-bold text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                  T{i + 1}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 pt-6 border-t border-border flex justify-between items-center">
            <div className="text-sm">
              <span className="text-muted-foreground">Dự báo tháng tới:</span>
              <span className="ml-2 font-bold text-emerald-600">+12.5%</span>
            </div>
            <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/5 rounded-xl font-bold">
              Chi tiết tài chính
            </Button>
          </div>
        </Card>

        <Card className="border-none shadow-[0_4px_12px_rgba(0,0,0,0.03)] bg-card/40 backdrop-blur-sm rounded-3xl p-6">
          <CardTitle className="text-xl mb-6">Thông báo</CardTitle>
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="h-10 w-10 shrink-0 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400">
                <AlertCircle className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-bold leading-none mb-1 text-foreground">Xác nhận thanh toán</p>
                <p className="text-xs text-muted-foreground line-clamp-2">Bạn có 3 đề nghị thanh toán (DNTT) cần phê duyệt hôm nay.</p>
                <p className="text-[10px] text-muted-foreground mt-2 font-medium">10 phút trước</p>
              </div>
            </div>
            <div className="flex gap-4 opacity-60">
              <div className="h-10 w-10 shrink-0 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-bold leading-none mb-1 text-foreground">Backup dữ liệu</p>
                <p className="text-xs text-muted-foreground">Hệ thống đã tự động sao lưu dữ liệu lúc 00:00 sáng.</p>
                <p className="text-[10px] text-muted-foreground mt-2 font-medium">8 giờ trước</p>
              </div>
            </div>
          </div>
          <Button variant="outline" className="w-full mt-8 rounded-xl bg-card/40 border-border hover:bg-card">
            Xem tất cả thông báo
          </Button>
        </Card>
      </div>
    </div>
  )
}