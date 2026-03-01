import { Card } from '@/components/ui/card'
import { TrendingUp } from 'lucide-react'

interface MetricCardProps {
  title: string
  value: string | number
  icon: React.ComponentType<{ className?: string }>
  trend?: number
  isValue?: boolean
}

export function MetricCard({
  title,
  value,
  icon: Icon,
  trend,
  isValue = true,
}: MetricCardProps) {
  return (
    <Card className="p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <h3 className="text-2xl font-bold mt-2">{value}</h3>
          {trend && (
            <div className="flex items-center gap-1 mt-2 text-sm text-accent">
              <TrendingUp className="w-4 h-4" />
              <span>+{trend}% from last month</span>
            </div>
          )}
        </div>
        <div className="p-3 bg-primary/10 rounded-lg">
          <Icon className="w-6 h-6 text-primary" />
        </div>
      </div>
    </Card>
  )
}
