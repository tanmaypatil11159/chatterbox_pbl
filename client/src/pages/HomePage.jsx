import React, { useContext, useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import ChatContainer from "../components/ChatContainer";
import RightSidebar from "../components/RightSidebar";
import { ChatContext } from "../../context/chatContext";

function HomePage() {
  const { selectedUser, isRightSidebarOpen, setSelectedUser } = useContext(ChatContext);
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
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  return (
    <div className="h-full overflow-hidden relative bg-[var(--bg)] text-[var(--text)]">
      <div
        className={`h-full grid box-border transition-all duration-300
          grid-cols-1
          ${!selectedUser ? "md:grid-cols-2" : "md:grid-cols-[1fr_2fr]"}
          ${selectedUser && isRightSidebarOpen ? "xl:grid-cols-[1fr_2fr_300px]" : ""}
        `}
        >
        
        {/* SIDEBAR (Friends List) */}
        <div className={`${selectedUser ? "hidden md:flex" : "flex"} flex-col min-h-0 border-r border-[var(--border)]`}>
          <Sidebar />
        </div>

        {/* CHAT AREA */}
        <div className={`${selectedUser ? "flex" : "hidden md:flex"} min-h-0 flex flex-col relative`}>
          <ChatContainer 
            onOpenLeft={() => setSelectedUser(null)}
            onOpenRight={() => { setShowMobileRight(true); setShowMobileLeft(false); }}
          />
        </div>

        {/* DESKTOP RIGHT SIDEBAR */}
        {selectedUser && isRightSidebarOpen && (
            <div className="hidden xl:flex flex-col min-h-0 border-l border-[var(--border)]">
                <RightSidebar />
            </div>
        )}

      </div>


      {/* MOBILE RIGHT SIDEBAR */}
      <div
        className={`fixed inset-y-0 right-0 z-[60] w-[85%] max-w-[320px] transform transition-all duration-300 ease-in-out xl:hidden bg-[var(--surface)] shadow-2xl ${showMobileRight ? 'translate-x-0' : 'translate-x-full'}`}
        role="dialog"
        aria-modal="true"
        aria-label="User details"
      >
         <RightSidebar onClose={() => setShowMobileRight(false)} />
      </div>

      {/* OVERLAY */}
      {(showMobileLeft || showMobileRight) && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[55] transition-opacity duration-300"
          role="presentation"
          aria-hidden="true"
          onClick={() => { setShowMobileLeft(false); setShowMobileRight(false); }}
        />
      )}
      
    </div>
  );
}

export default HomePage;

