import Link from "next/link"
import { ArrowUpRight, Wrench, Inbox } from "lucide-react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  RepairStatusBadge,
  RequestStatusBadge,
} from "@/components/shared/status-badge"
import { formatRelative } from "@/lib/format"
import type { Repair, SupportRequest } from "@/types"

export function RecentRepairs({ repairs }: { repairs: Repair[] }) {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle className="flex items-center gap-2">
          <Wrench className="size-4 text-muted-foreground" />
          Réparations récentes
        </CardTitle>
        <Button asChild variant="ghost" size="sm" className="gap-1 text-xs">
          <Link href="/repairs">
            Tout voir
            <ArrowUpRight className="size-3.5" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="px-2">
        <ul className="divide-y divide-border">
          {repairs.map((repair) => (
            <li key={repair.id}>
              <Link
                href={`/materials/${repair.material.id}`}
                className="flex items-center justify-between gap-3 rounded-md px-3 py-2.5 transition-colors hover:bg-muted/60"
              >
                <div className="min-w-0 space-y-0.5">
                  <p className="truncate text-sm font-medium">
                    {repair.description}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {repair.material.inventory_number} ·{" "}
                    {formatRelative(repair.reported_at)}
                  </p>
                </div>
                <RepairStatusBadge status={repair.status} />
              </Link>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}

export function RecentRequests({
  requests,
}: {
  requests: SupportRequest[]
}) {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle className="flex items-center gap-2">
          <Inbox className="size-4 text-muted-foreground" />
          Demandes récentes
        </CardTitle>
        <Button asChild variant="ghost" size="sm" className="gap-1 text-xs">
          <Link href="/requests">
            Tout voir
            <ArrowUpRight className="size-3.5" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="px-2">
        <ul className="divide-y divide-border">
          {requests.map((request) => (
            <li
              key={request.id}
              className="flex items-center justify-between gap-3 px-3 py-2.5"
            >
              <div className="min-w-0 space-y-0.5">
                <p className="truncate text-sm font-medium">{request.title}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {request.type} · {request.requested_by.full_name} ·{" "}
                  {formatRelative(request.created_at)}
                </p>
              </div>
              <RequestStatusBadge status={request.status} />
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
