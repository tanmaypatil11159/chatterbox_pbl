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

  const [showMobileLeft, setShowMobileLeft] = useState(false);
  const [showMobileRight, setShowMobileRight] = useState(false);

  // Close sidebars on ESC key
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === "Escape") {
        setShowMobileLeft(false);
        setShowMobileRight(false);
      }
    };

    window.addEventListener("keydown", handleEsc);

    return () => {
      window.removeEventListener("keydown", handleEsc);
    };
  }, []);

  return (
    <div className="h-full w-full overflow-hidden relative bg-[var(--bg)] text-[var(--text)]">
      
      {/* MAIN LAYOUT */}
      <div
        className={`
          h-full w-full min-w-0
          grid overflow-hidden
          transition-all duration-300
          grid-cols-1

          ${
            !selectedUser
              ? "md:grid-cols-[320px_minmax(0,1fr)]"
              : "md:grid-cols-[320px_minmax(0,1fr)]"
          }

          ${
            selectedUser && isRightSidebarOpen
              ? "xl:grid-cols-[320px_minmax(0,1fr)_300px]"
              : ""
          }
        `}
      >

        {/* LEFT SIDEBAR */}
        <div
          className={`
            ${selectedUser ? "hidden md:flex" : "flex"}
            min-w-0 overflow-hidden
            flex-col border-r border-[var(--border)]
          `}
        >
          <Sidebar />
        </div>

        {/* CHAT AREA */}
        <div
          className={`
            ${selectedUser ? "flex" : "hidden md:flex"}
            min-w-0 overflow-hidden
            flex-col relative
          `}
        >
          <ChatContainer
            onOpenLeft={() => setSelectedUser(null)}
            onOpenRight={() => {
              setShowMobileRight(true);
              setShowMobileLeft(false);
            }}
          />
        </div>

      </div>

      {/* MOBILE RIGHT SIDEBAR */}
      <div
        className={`
          fixed inset-y-0 right-0
          z-[60]
          w-[85%] max-w-[320px]
          bg-[var(--surface)]
          shadow-2xl
          transform transition-all duration-300 ease-in-out
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
      {(showMobileLeft || showMobileRight) && (
        <div
          className="
            fixed inset-0
            z-[55]
            bg-black/60
            backdrop-blur-sm
            transition-opacity duration-300
          "
          role="presentation"
          aria-hidden="true"
          onClick={() => {
            setShowMobileLeft(false);
            setShowMobileRight(false);
          }}
        />
      )}
    </div>
  );
}

export default HomePage;