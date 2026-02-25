export default function Layout({
  sidebar,
  chat,
}: {
  sidebar: React.ReactNode
  chat: React.ReactNode
}) {
  return (
    <div className="flex h-screen">
      <div className="w-full md:w-80 border-r">
        {sidebar}
      </div>
      <div className="flex-1">
        {chat}
      </div>
    </div>
  )
}