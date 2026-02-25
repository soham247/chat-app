import { UserButton } from "@clerk/nextjs"

function Navbar() {
  return (
    <div className="w-full py-2 px-1 flex items-center justify-between border-b">
        <h1 className="text-2xl text-blue-800 font-bold">Messages</h1>
        <UserButton afterSignOutUrl="/" />
    </div>
  )
}

export default Navbar