import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, Settings } from "lucide-react";
import { useAiChat } from "../hooks/useAiChat";
import AiChatSidebar from "../components/aiChat/AiChatSidebar";
import ChatWindow from "../components/aiChat/ChatWindow";
import Composer from "../components/aiChat/Composer";
import EmptyState from "../components/aiChat/EmptyState";

export default function AiChat() {
  const navigate = useNavigate();
  const {
    conversations,
    activeId,
    messages,
    isLoadingConversations,
    isLoadingMessages,
    isStreaming,
    error,
    refreshConversations,
    selectConversation,
    newChat,
    renameChat,
    deleteChat,
    sendMessage,
    editMessage,
    regenerate,
    continueGeneration,
    stop,
    retry,
  } = useAiChat();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => refreshConversations(searchQuery), 250);
    return () => clearTimeout(timer);
  }, [searchQuery, refreshConversations]);

  const activeTitle = conversations.find((c) => c.id === activeId)?.title;
  const lastMessage = messages[messages.length - 1];
  const showContinue =
    !isStreaming && lastMessage?.role === "assistant" && !!lastMessage.content.trim() && !lastMessage.errored;

  return (
    <div className="flex h-[calc(100vh-3rem)] lg:h-screen">
      <AiChatSidebar
        conversations={conversations}
        activeId={activeId}
        isLoading={isLoadingConversations}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSelect={selectConversation}
        onNew={newChat}
        onRename={renameChat}
        onDelete={deleteChat}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 min-w-0 flex flex-col bg-white dark:bg-[#202124]">
        <header className="flex-shrink-0 flex items-center gap-2 px-3 sm:px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label="Open sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>
          <h1 className="flex-1 text-sm font-medium text-gray-700 dark:text-gray-200 truncate">
            {activeTitle || "AI Chat"}
          </h1>
          <button
            type="button"
            onClick={() => navigate("/ai-chat/settings")}
            title="Settings"
            className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <Settings className="w-4.5 h-4.5" />
          </button>
        </header>

        {activeId || messages.length > 0 ? (
          <ChatWindow
            messages={messages}
            isLoadingMessages={isLoadingMessages}
            error={error}
            onRetry={retry}
            onEdit={editMessage}
            onRegenerate={regenerate}
          />
        ) : (
          <EmptyState onPick={sendMessage} />
        )}

        <Composer
          onSend={sendMessage}
          onStop={stop}
          isStreaming={isStreaming}
          showContinue={showContinue}
          onContinue={continueGeneration}
        />
      </div>
    </div>
  );
}
