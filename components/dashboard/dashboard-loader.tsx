import { Card } from '@/components/ui/card'

export function DashboardLoader() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="h-9 bg-muted rounded w-1/3 animate-pulse" />
        <div className="h-5 bg-muted rounded w-1/2 animate-pulse" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="p-6">
            <div className="space-y-3">
              <div className="h-4 bg-muted rounded w-1/2 animate-pulse" />
              <div className="h-8 bg-muted rounded w-2/3 animate-pulse" />
              <div className="h-4 bg-muted rounded w-3/4 animate-pulse" />
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-6">
          <div className="space-y-3">
            <div className="h-5 bg-muted rounded w-1/3 animate-pulse" />
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-10 bg-muted rounded animate-pulse" />
            ))}
          </div>
        </Card>
        <Card className="p-6">
          <div className="space-y-3">
            <div className="h-5 bg-muted rounded w-1/2 animate-pulse" />
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-6 bg-muted rounded animate-pulse" />
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
