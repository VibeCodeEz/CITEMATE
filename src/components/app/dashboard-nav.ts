import {
  AlertTriangle,
  BookOpenText,
  FolderKanban,
  LayoutDashboard,
  NotebookPen,
  ScanSearch,
} from "lucide-react";

type DashboardNavItem = {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  exact?: boolean;
};

export const dashboardNavItems: DashboardNavItem[] = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/sources", label: "Sources", icon: BookOpenText },
  { href: "/dashboard/needs-attention", label: "Needs Attention", icon: AlertTriangle },
  { href: "/dashboard/subjects", label: "Subjects", icon: FolderKanban },
  { href: "/dashboard/notes", label: "Notes", icon: NotebookPen },
  { href: "/dashboard/checklist", label: "Checklist", icon: ScanSearch },
];
