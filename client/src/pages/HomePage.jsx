import React, { useContext, useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import ChatContainer from "../components/ChatContainer";
import RightSidebar from "../components/RightSidebar";
import { ChatContext } from "../../context/chatContext";

function HomePage() {
  const {
    selectedUser,
    isRightSidebarOpen,
    setSelectedUser,
  } = useContext(ChatContext);

  const [showMobileRight, setShowMobileRight] = useState(false);

  // Close sidebars on ESC key
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === "Escape") {
        setShowMobileRight(false);
      }
    };

    window.addEventListener("keydown", handleEsc);

    return () => {
      window.removeEventListener("keydown", handleEsc);
    };
  }, []);

  return (
    <div className="h-full w-full flex overflow-hidden bg-[var(--bg)] text-[var(--text)]">

      {/* LEFT SIDEBAR */}
      <div
        className={`
          ${
            selectedUser ? "hidden md:flex" : "flex"
          }
          w-full md:w-[320px]
          shrink-0
          h-full
          border-r border-[var(--border)]
          overflow-hidden
          flex-col
        `}
      >
        <Sidebar />
      </div>

      {/* CHAT AREA */}
      <div className="flex-1 min-w-0 h-full flex overflow-hidden">
        <div
          className={`
            ${
              selectedUser ? "flex" : "hidden md:flex"
            }
            flex-1 min-w-0 h-full overflow-hidden flex-col
          `}
        >
          <ChatContainer
            onOpenLeft={() => setSelectedUser(null)}
            onOpenRight={() => {
              setShowMobileRight(true);
            }}
          />
        </div>

        {/* DESKTOP RIGHT SIDEBAR */}
        {selectedUser && isRightSidebarOpen && (
          <div
            className="
              hidden xl:flex
              w-[300px]
              shrink-0
              h-full
              border-l border-[var(--border)]
              overflow-hidden
              flex-col
            "
          >
            <RightSidebar />
          </div>
        )}
      </div>

      {/* MOBILE RIGHT SIDEBAR */}
      <div
        className={`
          fixed inset-y-0 right-0
          z-[60]
          w-[85%] max-w-[320px]
          bg-[var(--surface)]
          shadow-2xl
          transform transition-transform duration-300 ease-in-out
          xl:hidden
          ${
            showMobileRight
              ? "translate-x-0"
              : "translate-x-full"
          }
        `}
        role="dialog"
        aria-modal="true"
        aria-label="User details"
      >
        <RightSidebar
          onClose={() => setShowMobileRight(false)}
        />
      </div>

      {/* OVERLAY */}
      {showMobileRight && (
        <div
          className="
            fixed inset-0
            z-[55]
            bg-black/60
            backdrop-blur-sm
          "
          onClick={() => setShowMobileRight(false)}
        />
      )}
    </div>
  );
}

export default HomePage;