export default function DefaultChatView() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-primary gap-5">
      {/* Animated logo */}
      <div className="w-[80px] h-[80px] rounded-[22px] bg-[linear-gradient(135deg,#5b7fff22,#8b5cf622)] border border-border-primary flex items-center justify-center text-[2.5rem]">
        💬
      </div>
      <div className="text-center">
        <h2 className="font-semibold text-lg text-text-primary mb-2">
          Select a conversation
        </h2>
        <p className="text-text-secondary text-sm max-w-[280px]">
          Choose a conversation from the sidebar or start a new one by tapping a person.
        </p>
      </div>
    </div>
  );
}