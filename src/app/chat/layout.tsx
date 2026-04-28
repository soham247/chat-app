"use client";

import { usePathname } from "next/navigation";

export default function Layout({
  sidebar,
  chat,
}: {
  sidebar: React.ReactNode;
  chat: React.ReactNode;
}) {
  const pathname = usePathname();
  const isInChat = pathname !== "/chat";

  return (
    <div className="flex h-screen overflow-hidden bg-primary">
      <div className={`shrink-0 flex-col overflow-hidden w-full md:w-[320px] ${isInChat ? "hidden md:flex" : "flex"}`}>
        {sidebar}
      </div>
      <div className={`flex-1 min-w-0 flex-col overflow-hidden ${isInChat ? "flex" : "hidden md:flex"}`}>
        {chat}
      </div>
    </div>
  );
}