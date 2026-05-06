import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../context/authContext";
import { ChatContext } from "../../context/chatContext";
import { NotificationContext } from "../../context/NotificationContext";
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import {
  Users,
  UserCheck,
  MessageCircle,
  Activity,
  Home,
  Bell
} from "lucide-react";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from "recharts";

function Dashboard() {

  const { authUser, onlineUsers, axios } = useContext(AuthContext);
  const { users, getUsers } = useContext(ChatContext);
  const { notifications } = useContext(NotificationContext);

  const [dbStats, setDbStats] = useState({
    messagesSent: 0,
    activeRooms: 0,
    totalUsers: 0,
    activityData: []
  });

  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    getUsers();
    fetchDbStats();
  }, []);

  const fetchDbStats = async () => {
    try {
      setLoadingStats(true);
      const { data } = await axios.get("/api/auth/stats");
      if (data.success) {
        setDbStats(data.stats);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoadingStats(false);
    }
  };

  const friends = users.filter(u => u.friendStatus === "friend");
  const onlineFriends = friends.filter(f => onlineUsers.includes(f._id));

  const cards = [
    {
      title: "Friends",
      value: friends.length,
      icon: <Users size={26} />,
      color: "bg-[var(--accent)]"
    },
    {
      title: "Online",
      value: onlineFriends.length,
      icon: <UserCheck size={26} />,
      color: "bg-[var(--primary)]"
    },
    {
      title: "Rooms",
      value: dbStats.activeRooms,
      icon: <Home size={26} />,
      color: "bg-[var(--primary)]"
    },
    {
      title: "Users",
      value: dbStats.totalUsers,
      icon: <Users size={26} />,
      color: "bg-[var(--accent)]"
    },
    {
      title: "Messages",
      value: dbStats.messagesSent,
      icon: <MessageCircle size={26} />,
      color: "bg-[var(--accent)]"
    },
    {
      title: "Notifications",
      value: notifications.filter(n => !n.isRead).length,
      icon: <Bell size={26} />,
      color: "bg-[var(--primary)]"
    }
  ];

  const getActivityText = (n) => {
    if (n.content) return n.content;
    const sender = n.sender?.fullName || "Someone";
    if (n.type === "friend_request") return `Friend request from ${sender}`;
    if (n.type === "room_invite") return `Room invite from ${sender}`;
    if (n.type === "message") return `New message from ${sender}`;
    if (n.type === "info") return "New activity";
    return "Unknown activity";
  };

  return (

    <div className="bg-[var(--bg)] text-[var(--text-primary)] p-4 sm:p-8 overflow-y-auto min-h-full">

      {/* HEADER */}

      <div className="flex justify-between items-center flex-wrap mb-8 sm:mb-12">
        <div className="max-w-4xl">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-black text-[var(--primary)] leading-[1.1] tracking-tight">
            Welcome back,{" "}
            <span className="rainbow-text block sm:inline">
              {authUser?.fullName} !
            </span>
          </h1>
<DotLottieReact
      src="https://lottie.host/1ccfd922-4109-4ef8-a6b3-bafce4ab8a98/j3jMnb5zJi.lottie"
      loop
      autoplay
    />
          <p className="text-base sm:text-lg md:text-xl font-bold text-[var(--text-secondary)] mt-4 max-w-2xl opacity-90">
            Your chat playground is ready. Dive in and connect with your friends!
          </p>
        </div>
      </div>

      {/* CARTOON STATS */}

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6">
        {cards.map((card, index) => {
          return (
            <div
              key={index}
              className={`
              ${card.color}
              border-2 sm:border-4 border-[var(--text-primary)]
              rounded-xl sm:rounded-3xl
              p-3 sm:p-6
              flex flex-col md:flex-row items-center gap-2 sm:gap-4
              transition-all duration-300
              hover:-translate-y-2
              hover:shadow-[8px_8px_0px_0px_var(--text-primary)]
              cursor-pointer
              group
            `}>

              <div className="bg-[var(--surface)] p-2 sm:p-3 rounded-full border-2 sm:border-3 border-[var(--text-primary)] text-[var(--text-primary)] transition-transform group-hover:rotate-12">
                {React.cloneElement(card.icon, { size: 24 })}
              </div>

              <div className="text-[var(--text-primary)] text-center sm:text-left">
                <p className="text-2xl sm:text-3xl font-black">
                  {card.value}
                </p>
                <p className="text-[10px] sm:text-xs font-black uppercase tracking-widest opacity-80">
                  {card.title}
                </p>
              </div>

            </div>
          );
        })}
      </div>

      {/* LOWER PANELS */}

      <div className="mt-8 sm:mt-12 grid grid-cols-1 lg:grid-cols-2 gap-6">



        {/* RECENT ACTIVITY */}

        <div className="
  bg-[var(--surface)]
  border-2 sm:border-4 border-[var(--text-primary)]
  rounded-2xl sm:rounded-3xl
  p-4 sm:p-6
  ">

          <h2 className="text-lg sm:text-xl font-black mb-4 text-[var(--text-primary)]">
            Recent Activity
          </h2>

          <ul className="space-y-3 text-xs sm:text-sm text-[var(--text-primary)]">

            {notifications.length > 0 ? (

              notifications.slice(0, 5).map((n, i) => (
                <li key={i} className="flex gap-2 items-center p-2 rounded-lg hover:bg-[var(--bg)] transition-colors">
                  <div className="w-2 h-2 rounded-full bg-[var(--primary)]" />
                  <span className="truncate">{getActivityText(n)}</span>
                </li>
              ))
            ) : (
              <p className="text-[var(--text-secondary)] italic">No recent activity.</p>
            )}

          </ul>

        </div>

      </div>

    </div>

  );
}

export default Dashboard;