import React, { useContext, useEffect, useState } from "react";
import { Scan, Plus, X, Search, LogOut, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/authContext";
import { RoomContext } from "../../context/roomContext";
import { QRCodeCanvas as QRCode } from "qrcode.react";
import BottomBar from "./BottomBar";

function RoomSidebar({ onClose }) {
  const { logout, authUser, axios } = useContext(AuthContext);

  const {
    rooms = { created: [], joined: [], other: [] },
    invitations = [],
    acceptRoomInvite,
    rejectRoomInvite,
    loadRooms,
    activeRoom,
    setActiveRoom,
    createRoom
  } = useContext(RoomContext);

  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [showQR, setShowQR] = useState(false);
  const [qrUrl, setQrUrl] = useState("");
  const [showMenu, setShowMenu] = useState(false);
  const [showRoomForm, setShowRoomForm] = useState(false);

  const [form, setForm] = useState({
    roomName: "",
    description: "",
    expiryTime: 60,
    allowRequests: true,
    maxMembers: "",
    joinPassword: ""
  });

  useEffect(() => {
    loadRooms();
  }, [loadRooms]);



  const filterList = (list) => {
    return (list || []).filter((room) =>
      room?.roomName?.toLowerCase().includes(search.toLowerCase())
    );
  };

  // ✅ FIX: creatorId comparison (ObjectId safe)
  const createdRooms = filterList(rooms.created || []).filter(
    (room) =>
      room && authUser?._id && String(room.creatorId?._id || room.creatorId) ===
      String(authUser._id)
  );

  const joinedRooms = filterList(rooms.joined || []).filter(
    (room) =>
      room && authUser?._id && String(room.creatorId?._id || room.creatorId) !==
      String(authUser._id)
  );

  const handleCreateRoom = async (e) => {
    e.preventDefault();

    const created = await createRoom({
      ...form,
      maxMembers: form.maxMembers
        ? Number(form.maxMembers)
        : undefined
    });

    if (!created) return;

    setShowRoomForm(false);

    setForm({
      roomName: "",
      description: "",
      expiryTime: 30,
      allowRequests: true,
      maxMembers: "",
      joinPassword: ""
    });
  };

  return (
    <div className="cartoon-panel_3 border-r-0 p-4 flex flex-col gap-4 h-full overflow-hidden bg-[#FEEE91] relative">

      {/* PROFILE HEADER */}
      <div className="flex items-center gap-3 w-full">
        
              <h1 className="text-4xl font-bold">
Create Room</h1>
        
      </div>

      {/* SEARCH */}
      <input
        className="cartoon-input"
        placeholder="Search rooms..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* CREATE ROOM */}
      <div className="flex justify-center gap-4">
        <button
          onClick={() => setShowRoomForm(true)}
          className="saas-btn bg-[var(--primary)] text-white flex items-center justify-center w-full max-w-[200px]"
        >
          <Plus size={18} />
          Create Room
        </button>
      </div>

      {/* ROOM LIST */}
      <div className="flex-1 overflow-y-auto flex flex-col gap-6 pr-1 no-scrollbar pb-20">

        {/* INVITATIONS */}
        {invitations.length > 0 && (
          <div className="flex flex-col gap-2">
            <p className="text-[10px] font-black text-[#7C3AED] uppercase ml-2">
              Requested Rooms ({invitations.length})
            </p>

            {invitations.map((inv) => (
              <div
                key={`inv-${inv._id}`}
                
                className="cartoon-panel p-3 flex items-center gap-3 bg-[#F5F3FF] border-[#7C3AED] border-dashed"
              >
                
                <div className="w-10 h-10 rounded-full bg-[#7C3AED] flex items-center justify-center font-bold text-white text-xs">
                  {inv.roomName?.[0]?.toUpperCase() || "R"}
                </div>
                <div className="flex flex-col flex-1 min-w-0">
                  <p className="font-extrabold truncate text-sm text-[#111827]">{inv.roomName}</p>
                  <p className="text-[12px] font-bold text-red-500 truncate italic">Invited to join</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => acceptRoomInvite(inv._id, inv.inviteToken)}
                    className="saas-btn bg-green-500 text-[15px] px-3 py-1.5"
                  >✓
                    Accept
                  </button>
                  <button
                    onClick={() => rejectRoomInvite(inv._id, inv.inviteToken)}
                    className="saas-btn  bg-red-500 text-[15px] px-3 py-1.5"
                  >✗
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CREATED ROOMS SECTION */}
        {createdRooms.length > 0 && (
          <div className="flex flex-col gap-2">
            <p className="text-[10px] font-black text-[#16A34A] uppercase ml-2">Created Rooms ({createdRooms.length})</p>
            {createdRooms.map((room) => (
              <RoomItem
                key={room._id}
                room={room}
                isMember={true}
                isSelected={activeRoom?._id === room._id}
                onSelect={() => { 
                  console.log("RoomSidebar: Selecting room ->", room.roomName);
                  setActiveRoom(room); 
                  if (onClose) onClose(); 
                }}
              />
            ))}
          </div>
        )}

        {/* JOINED ROOMS SECTION */}
        {joinedRooms.length > 0 && (
          <div className="flex flex-col gap-2">
            <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest ml-2">Active Chats ({joinedRooms.length})</p>
            {joinedRooms.map((room) => (
              <RoomItem
                key={room._id}
                room={room}
                isMember={true}
                isSelected={activeRoom?._id === room._id}
                onSelect={() => { 
                  console.log("RoomSidebar: Selecting room ->", room.roomName);
                  setActiveRoom(room); 
                  if (onClose) onClose(); 
                }}
              />
            ))}
          </div>
        )}

        {createdRooms.length === 0 && joinedRooms.length === 0 && (invitations || []).length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-3">
            <div className="w-16 h-16 rounded-full border-4 border-dashed border-gray-200 flex items-center justify-center opacity-50">
               <Search size={32} />
            </div>
            <p className="font-bold text-center px-6">No rooms found. Try creating one!</p>
          </div>
        )}
      </div>

      {showMenu && (
        <>
          <div
            className="fixed inset-0 bg-black/30 z-40"
            onClick={() => setShowMenu(false)}
          />

          <div className="absolute top-16 right-4 w-56 bg-white border-4 shadow-xl p-4 flex flex-col gap-3 z-50">
            <div className="flex flex-col items-center gap-2 pb-2 border-b-2 border-black">
              <img
                src={authUser?.profilePic || `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(authUser?.fullName || authUser?.username || "U")}&backgroundColor=8B5CF6,4F46E5,EC4899,10B981,F59E0B`}
                className="w-16 h-16 rounded-full object-cover border border-black"
              />
              <p className="font-extrabold">{authUser?.fullName}</p>
            </div>

            <button
              onClick={() => {
                navigate("/settings");
                setShowMenu(false);
              }}
              className="cartoon-btn bg-[#A1EEBD]"
            >
              Profile
            </button>

            <button
              onClick={() => {
                logout();
                setShowMenu(false);
              }}
              className="cartoon-btn bg-[#FF8C8C]"
            >
              Logout
            </button>
          </div>
        </>
      )}

      {/* CREATE ROOM MODAL */}
      {showRoomForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" role="presentation">
          <div
            className="bg-white p-6 rounded-3xl border-4 border-black shadow-xl w-full max-w-md animate-fadeIn"
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-room-title"
            tabIndex={-1}
          >

            <div className="flex justify-between items-center mb-6">
              <h2 id="create-room-title" className="font-extrabold text-xl">
                Create Room
              </h2>

              <button
                type="button"
                onClick={() => setShowRoomForm(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
                aria-label="Close create room dialog"
              >
                <X size={22} />
              </button>
            </div>

            <form onSubmit={(e) => { handleCreateRoom(e) }} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="font-bold text-sm ml-2 flex gap-1">Room Name <p className="text-red-500"> *</p></label>
                <input
                  className="cartoon-input"
                  placeholder="Super Chat Room"
                  value={form.roomName}
                  onChange={(e) =>
                    setForm({ ...form, roomName: e.target.value })
                  }
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-bold text-sm ml-2">Description</label>
                <input
                  className="cartoon-input"
                  placeholder="A place for fun talks"
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">

                <div className="flex flex-col gap-1">
                  <label className="font-bold text-sm ml-2 gap-1 flex">
                    Max Members
                    <p className="text-red-500"> *</p>
                  </label>

                  <input
                    className="cartoon-input"
                    placeholder="Unlimited"
                    type="number"
                    value={form.maxMembers}
                    onChange={(e) =>
                      setForm({ ...form, maxMembers: e.target.value })
                    }
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-bold text-sm ml-2 gap-1 flex">
                    Expiry (mins)
                    <p className="text-red-500"> *</p>
                  </label>

                  <input
                    className="cartoon-input"
                    type="number"
                    value={form.expiryTime}
                    onChange={(e) =>
                      setForm({ ...form, expiryTime: e.target.value })
                    }
                  />
                </div>

              </div>

              <button
                type="submit"
                className="cartoon-btn bg-[#16A34A] text-white mt-2"
              >
                Launch Room
              </button>

            </form>

          </div>
        </div>
      )}

      {/* QR MODAL */}
      {showQR && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" role="presentation">
          <div
            className="bg-white p-6 rounded-xl border-4 border-black flex flex-col items-center gap-4 animate-fadeIn"
            role="dialog"
            aria-modal="true"
            aria-labelledby="room-qr-modal-title"
            tabIndex={-1}
          >

            <h2 id="room-qr-modal-title" className="font-extrabold text-lg">
              {authUser?.fullName}
            </h2>

            <QRCode
              value={qrUrl || `${window.location.origin}`}
              size={200}
              bgColor="#FEEE91"
              fgColor="#000000"
            />

            <button
              type="button"
              onClick={() => setShowQR(false)}
              className="cartoon-btn bg-[#FF6F91] w-full"
            >
              Close
            </button>

          </div>
        </div>
      )}
    </div>
  );
}

function RoomItem({ room, isMember, isPending, isSelected, onSelect }) {
  const isFull = room.maxMembers && room.members?.length >= room.maxMembers;

  const handleClick = (e) => {
    if (isMember) {
      onSelect();
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      aria-selected={isSelected}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleClick();
        }
      }}
      onClick={handleClick}
      className={`w-full text-left cartoon-panel_2 p-3 flex items-center gap-3 cursor-pointer relative transition-all duration-200 ${
        isSelected 
          ? "bg-[#fff6c3] shadow-[inset_0_-4px_0_0_rgba(0,0,0,0.25)] cursor-default" 
          : "bg-white hover:shadow-[inset_0_-4px_0_0_rgba(0,0,0,0.15)]"
      }`}
    >
      <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-[#111827] flex items-center justify-center font-bold text-white shrink-0 ${
        isMember ? "bg-[#16A34A]" : isPending ? "bg-orange-400" : "bg-[#7C3AED]"
      }`}>
        {room.roomName?.[0]?.toUpperCase() || "R"}
      </div>

      <div className="flex flex-col flex-1 min-w-0">
        <div className="flex justify-between items-center">
          <p className="font-extrabold truncate text-[#111827] text-sm sm:text-base">
            {room.roomName}
          </p>

          <div className="flex items-center gap-1">
            {isFull && (
              <span className="text-[8px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full font-black uppercase tracking-tighter border border-red-200">Full</span>
            )}
            {isMember ? (
              <span className="text-[10px] bg-[#16A34A] text-white px-1.5 py-0.5 rounded-full font-bold uppercase">
                Member
              </span>
            ) : isPending ? (
              <span className="text-[10px] bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded-full font-bold uppercase border border-orange-200">
                Pending
              </span>
            ) : null}
          </div>
        </div>

        <p className="text-[10px] sm:text-xs text-gray-500 truncate">
          {room.members?.length || 0} members • {room.description || "No description"}
        </p>
      </div>
    </div>
  );
}

export default RoomSidebar;