import { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus, AlertTriangle, CheckCircle2, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface KPICardProps {
  title: ReactNode;
  value: string | number;
  subtitle?: string;
  badge?: {
    label: string;
    variant: "default" | "destructive" | "secondary" | "outline";
    color?: "success" | "warning";
  };
  trend?: {
    value: string;
    direction: "up" | "down" | "neutral";
    isPositive?: boolean;
  };
  goal?: string;
  progress?: number;
  icon?: ReactNode;
  status?: "critical" | "warning" | "success" | "info";
  className?: string;
  titleClassName?: string;
  titleAdornment?: ReactNode;
  children?: ReactNode;
}

const statusConfig = {
  critical: {
    icon: AlertTriangle,
    className: "border-destructive/50 bg-destructive/5",
    iconClassName: "text-destructive",
  },
  warning: {
    icon: AlertTriangle,
    className: "border-warning/50 bg-warning/5",
    iconClassName: "text-warning",
  },
  success: {
    icon: CheckCircle2,
    className: "border-success/50 bg-success/5",
    iconClassName: "text-success",
  },
  info: {
    icon: Info,
    className: "border-info/50 bg-info/5",
    iconClassName: "text-info",
  },
};

export function KPICard({
  title,
  value,
  subtitle,
  badge,
  trend,
  goal,
  progress,
  icon,
  status,
  className,
  titleClassName,
  titleAdornment,
  children,
}: KPICardProps) {
  const StatusIcon = status ? statusConfig[status].icon : null;

  return (
    <Card
      className={cn(
        "p-6 bg-card hover:bg-card-dashboard-hover transition-all duration-200 border-border/50",
        status && statusConfig[status].className,
        className
      )}
    >
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
              <div className="flex items-center gap-2">
                {icon && <div className="text-muted-foreground">{icon}</div>}
                <h3 className={cn("text-sm font-medium text-muted-foreground", titleClassName)}>{title}</h3>
              </div>
              {titleAdornment && <div className="flex items-center gap-2">{titleAdornment}</div>}
            </div>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-bold text-foreground">{value}</p>
              {badge && (
                <Badge
                  variant={badge.variant}
                  className={cn(
                    "text-xs",
                    badge.color === "success" && "bg-success text-success-foreground",
                    badge.color === "warning" && "bg-warning text-warning-foreground"
                  )}
                >
                  {badge.label}
                </Badge>
              )}
            </div>
            {subtitle && (
              <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
            )}
          </div>

          {StatusIcon && (
            <StatusIcon className={cn("h-5 w-5", status && statusConfig[status].iconClassName)} />
          )}
        </div>

        {trend && (
          <div className="flex items-center gap-1.5">
            {trend.direction === "up" && (
              <TrendingUp
                className={cn(
                  "h-4 w-4",
                  trend.isPositive ? "text-success" : "text-destructive"
                )}
              />
            )}
            {trend.direction === "down" && (
              <TrendingDown
                className={cn(
                  "h-4 w-4",
                  trend.isPositive ? "text-success" : "text-destructive"
                )}
              />
            )}
            {trend.direction === "neutral" && (
              <Minus className="h-4 w-4 text-muted-foreground" />
            )}
            <span
              className={cn(
                "text-sm font-medium",
                trend.direction === "up" && (trend.isPositive ? "text-success" : "text-destructive"),
                trend.direction === "down" && (trend.isPositive ? "text-success" : "text-destructive"),
                trend.direction === "neutral" && "text-muted-foreground"
              )}
            >
              {trend.value}
            </span>
          </div>
        )}

        {goal && (
          <div className="text-sm text-muted-foreground">
            Meta: <span className="font-medium text-foreground">{goal}</span>
          </div>
        )}

        {progress !== undefined && (
          <div className="space-y-1.5">
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all",
                  progress >= 100 ? "bg-success" : progress >= 85 ? "bg-secondary" : "bg-warning"
                )}
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
          </div>
        )}

        {children}
      </div>
    </Card>
  );
}
