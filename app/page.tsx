'use client'

import { useDashboardMetrics } from '@/lib/hooks'
import { formatCurrency } from '@/lib/utils'
import { Card } from '@/components/ui/card'
import { DashboardLoader } from '@/components/dashboard/dashboard-loader'
import { MetricCard } from '@/components/dashboard/metric-card'
import { RecentRentals } from '@/components/dashboard/recent-rentals'
import { BarChart3, Users, Package, Truck, TrendingUp } from 'lucide-react'

export default function DashboardPage() {
  const { metrics, isLoading } = useDashboardMetrics()

  if (isLoading) {
    return <DashboardLoader />
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to your rental management system
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Customers"
          value={metrics?.totalCustomers || 0}
          icon={Users}
          trend={12}
        />
        <MetricCard
          title="Total Products"
          value={metrics?.totalProducts || 0}
          icon={Package}
          trend={8}
        />
        <MetricCard
          title="Active Rentals"
          value={metrics?.activeRentals || 0}
          icon={Truck}
          trend={15}
        />
        <MetricCard
          title="Total Revenue"
          value={formatCurrency(metrics?.totalRevenue || 0)}
          icon={TrendingUp}
          trend={22}
          isValue={false}
        />
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <RecentRentals rentals={metrics?.recentRentals || []} />
        </Card>
        <Card>
          <div className="p-6">
            <h3 className="font-semibold text-lg mb-4">Quick Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Avg. Rental Value</span>
                <span className="font-medium">
                  {formatCurrency((metrics?.totalRevenue || 0) / Math.max(metrics?.activeRentals || 1, 1))}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Revenue Growth</span>
                <span className="font-medium text-accent">+22%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Occupancy Rate</span>
                <span className="font-medium">87%</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
