"use client";

import { usePathname } from "next/navigation";

export function ShellFrame({
  children,
  topBar,
  sidebar,
}: {
  children: React.ReactNode;
  topBar: React.ReactNode;
  sidebar: React.ReactNode;
}) {
  const pathname = usePathname();

  if (pathname === "/") {
    return <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-primary)]">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-primary)]">
      {topBar}
      <div className="flex pt-[100px]">
        {sidebar}
        <div className="min-w-0 flex-1 border-l border-[var(--border-subtle)] md:ml-64">
          <div className="mx-auto max-w-[1540px] p-4 sm:p-5 lg:p-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
