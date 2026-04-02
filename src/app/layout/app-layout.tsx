import type { ReactNode } from "react";

import { AppHeader } from "./app-header";
import { SidebarNav } from "./sidebar-nav";

type AppLayoutProps = {
  children: ReactNode;
};

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,_#f7f4ee_0%,_#f1ede6_48%,_#ebe5dc_100%)] text-stone-900">
      <div className="mx-auto flex min-h-screen w-full max-w-[1600px]">
        <SidebarNav />

        <div className="flex min-h-screen min-w-0 flex-1 flex-col">
          <AppHeader />

          <main className="flex-1 px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
            <div className="mx-auto w-full max-w-6xl">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
