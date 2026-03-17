import { dashboardNavItems } from "@/components/app/dashboard-nav";
import { NavLink } from "@/components/app/nav-link";

export function AppSidebar() {
  return (
    <>
      <nav className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-2 lg:hidden">
        {dashboardNavItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink key={item.href} href={item.href} exact={item.exact}>
              <Icon className="size-4" />
              {item.label}
            </NavLink>
          );
        })}
      </nav>
      <aside className="hidden lg:block">
        <div className="sticky top-4 rounded-[2rem] border border-border/70 bg-background/85 p-4 shadow-lg shadow-teal-950/5 backdrop-blur">
          <p className="px-3 pb-3 text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
            Workspace
          </p>
          <nav className="flex flex-col gap-2">
            {dashboardNavItems.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.href}
                  href={item.href}
                  exact={item.exact}
                  className="justify-start rounded-2xl px-3 py-3"
                >
                  <Icon className="size-4" />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>
        </div>
      </aside>
    </>
  );
}
