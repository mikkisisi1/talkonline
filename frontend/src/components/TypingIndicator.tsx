export const TypingIndicator = () => {
  return (
    <div className="flex justify-start message-animate">
      <div className="bg-bubble-received/85 px-4 py-3 rounded-t-bubble rounded-br-bubble rounded-bl-md shadow-sm">
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 bg-muted-foreground/60 rounded-full typing-dot" />
          <span className="w-2 h-2 bg-muted-foreground/60 rounded-full typing-dot" />
          <span className="w-2 h-2 bg-muted-foreground/60 rounded-full typing-dot" />
        </div>
      </div>
    </div>
  );
};
