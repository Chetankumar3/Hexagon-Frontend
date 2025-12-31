import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FloatingNav } from "../ui/floating-navbar.jsx";
import SearchUsers from "../SearchUsers";
import LanguageSwitcher from "../ui/LanguageSwitcher.jsx";
import { IconHome, IconMessage, IconUser, IconLogin, IconDatabase, IconLogout, IconBell, IconBellRinging, IconX } from "@tabler/icons-react";
import { useAuth } from "../../contexts/AuthContext";
import { subscribeToPush, unsubscribeFromPush, isSubscribed, registerServiceWorker } from "../../utils/pushNotifications";
import { useNotificationsSocket } from "../../hooks/useNotificationsSocket";

const Navbar = () => {
  const { t } = useTranslation();
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(false);
  const [pushLoading, setPushLoading] = useState(false);
  
  // Use WebSocket hook for real-time notifications
  const { notifications, isConnected, markAsRead } = useNotificationsSocket();
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  useEffect(() => {
    if (isAuthenticated()) {
      // Register service worker on mount
      registerServiceWorker();
      
      // Check push subscription status
      isSubscribed().then(setPushEnabled);
    }
  }, [isAuthenticated]);

  const handlePushToggle = async () => {
    setPushLoading(true);
    try {
      if (pushEnabled) {
        await unsubscribeFromPush();
        setPushEnabled(false);
      } else {
        const success = await subscribeToPush();
        if (success) {
          setPushEnabled(true);
        }
      }
    } catch (error) {
      console.error("Push toggle error:", error);
    } finally {
      setPushLoading(false);
    }
  };

  const handleNotificationClick = (notification) => {
    // Mark as read if not already read
    if (!notification.isRead) {
      markAsRead(notification._id);
    }
    
    if (notification.relatedPostId) {
      // Navigate to profile page where posts are displayed
      navigate("/profile");
      setOpen(false);
    }
  };

  // Left group (desktop center-left): main links. Right group: actions like Login/Signup or Profile/Logout
  const navItems = [
    { name: t("common.home"), link: "/", icon: <IconHome size={18} /> },
    { name: t("common.about"), link: "/about", icon: <IconDatabase size={18} /> },
    { name: t("common.courses"), link: "/courses", icon: <IconDatabase size={18} /> },
    { name: t("common.challenges"), link: "/challenges", icon: <IconDatabase size={18} /> },
    { name: t("common.reels"), link: "/reels", icon: <IconDatabase size={18} /> },
    { name: t("common.classroom"), link: "/vr", icon: <IconDatabase size={18} /> },
  ];

  const actions = isAuthenticated() 
    ? [
        { 
          name: t("common.profile"), 
          link: "/profile", 
          icon: <IconUser size={18} /> 
        },
        { 
          name: t("common.logout"), 
          link: "#", 
          icon: <IconLogout size={18} />,
          onClick: logout
        }
      ]
    : [
        { name: t("common.login"), link: "/login", icon: <IconLogin size={18} /> },
        { name: t("common.signup"), link: "/signup", icon: <IconUser size={18} /> },
      ];

  return (
    <>
      <FloatingNav navItems={navItems} actions={actions} extraCenter={<SearchUsers />} />
      <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
        {/* Language Switcher */}
        <LanguageSwitcher />
        
        {isAuthenticated() && (
          <>
            {/* Notifications Bell */}
            <div className="relative">
            <button onClick={() => setOpen((v) => !v)} className="relative rounded-full p-2 bg-white shadow ring-1 ring-zinc-200 hover:bg-zinc-50">
              <IconBell size={18} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-black text-white text-[10px] flex items-center justify-center">{unreadCount}</span>
              )}
            </button>
            {open && (
              <div className="absolute right-0 mt-2 w-80 max-h-96 flex flex-col rounded-2xl bg-white shadow-lg ring-1 ring-zinc-200">
                {/* Header with close button */}
                <div className="sticky top-0 bg-white border-b border-zinc-200 p-3 flex items-center justify-between rounded-t-2xl">
                  <div className="text-sm font-semibold">{t("common.notifications")}</div>
                  <button
                    onClick={() => setOpen(false)}
                    className="p-1 rounded-full hover:bg-zinc-100 transition-colors"
                    title={t("common.close")}
                  >
                    <IconX size={16} className="text-zinc-600" />
                  </button>
                </div>
                
                {/* Notifications list */}
                <div className="overflow-auto flex-1 p-3">
                  {notifications.length === 0 ? (
                    <div className="text-sm text-zinc-500 text-center py-4">{t("common.noNotifications")}</div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n._id}
                        onClick={() => handleNotificationClick(n)}
                        className={`mb-2 rounded-lg border p-3 cursor-pointer transition-colors ${
                          n.isRead ? 'bg-zinc-50 hover:bg-zinc-100' : 'bg-blue-50 hover:bg-blue-100'
                        }`}
                      >
                        <div className="text-sm text-zinc-800">{n.message}</div>
                        <div className="text-xs text-zinc-500 mt-1">{new Date(n.createdAt).toLocaleString()}</div>
                      </div>
                    ))
                  )}
                </div>

                {/* Toggle Switch for Push Notifications at bottom */}
                <div className="sticky bottom-0 border-t border-zinc-200 bg-white p-3 rounded-b-2xl">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-zinc-600">{t("common.pushNotifications")}</span>
                    <button
                      onClick={handlePushToggle}
                      disabled={pushLoading}
                      className={`relative inline-flex h-4 w-7 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-1 ${
                        pushEnabled ? 'bg-black' : 'bg-zinc-300'
                      } ${pushLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                      title={pushEnabled ? t("common.disablePushNotifications") : t("common.enablePushNotifications")}
                    >
                      <span
                        className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                          pushEnabled ? 'translate-x-4' : 'translate-x-0.5'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
          </>
        )}
      </div>
    </>
  );
};

export default Navbar;
