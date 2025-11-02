import { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";

interface SectionHeaderProps {
  title: string;
  badge?: string;
  icon?: ReactNode;
}

export function SectionHeader({ title, badge, icon }: SectionHeaderProps) {
  return (
    <div className="flex items-center gap-3 mb-4">
      {icon && <div className="text-primary">{icon}</div>}
      <h2 className="text-2xl font-bold text-foreground">{title}</h2>
      {badge && (
        <Badge variant="secondary" className="text-sm">
          {badge}
        </Badge>
      )}
    </div>
  );
}
