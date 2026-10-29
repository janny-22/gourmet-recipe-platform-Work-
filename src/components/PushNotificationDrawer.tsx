import React from 'react';
import { PushNotification, ApplicationUser } from '../types';
import { pushNotificationService } from '../services/pushNotificationService';
import { soundEffects } from '../services/soundEffects';
import { formatRelativeTime } from '../utils/textUtils';
import { 
  X, 
  Bell, 
  Send, 
  CheckCheck, 
  Volume2, 
  VolumeX, 
  ExternalLink,
  Smartphone,
  Radio,
  CheckCircle2
} from 'lucide-react';

interface PushNotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: PushNotification[];
  onSelectRecipe: (recipeId: string) => void;
  onOpenBroadcast: () => void;
  onMarkAllRead: () => void;
  currentUser: ApplicationUser;
}

export const PushNotificationDrawer: React.FC<PushNotificationDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  onSelectRecipe,
  onOpenBroadcast,
  onMarkAllRead,
  currentUser,
}) => {
  const [browserPermission, setBrowserPermission] = React.useState<string>(
    typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'default'
  );
  const [soundEnabled, setSoundEnabled] = React.useState(soundEffects.isSoundEnabled());

  const handleRequestPermission = async () => {
    const res = await pushNotificationService.requestBrowserPermission();
    setBrowserPermission(res);
    if (res === 'granted') {
      soundEffects.playPushNotificationChime();
    }
  };

  const handleToggleSound = () => {
    const next = !soundEnabled;
    soundEffects.setSoundEnabled(next);
    setSoundEnabled(next);
    if (next) soundEffects.playPushNotificationChime();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs flex justify-end">
      <div className="relative w-full max-w-md bg-[#FFFFFF] h-full shadow-2xl flex flex-col border-l border-[#E8DFD8] animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="p-5 border-b border-[#E8DFD8] bg-[#FAF7F2] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#F0E6DD] text-[#C46836] flex items-center justify-center">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-[#2D241E]">
                Notifications & Alerts
              </h3>
              <p className="text-xs text-[#7C6E65]">
                Real-time instant recipe push dispatch hub
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#A6978A] hover:text-[#2D241E] hover:bg-[#F2ECE4] transition-colors cursor-pointer"
            aria-label="Close notifications"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Browser Push Permission Banner */}
        <div className="p-4 bg-[#F5EFEB] border-b border-[#E8DFD8]">
          <div className="flex items-start gap-3">
            <Smartphone className="w-5 h-5 text-[#C46836] shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-[#2D241E] flex items-center gap-2">
                <span>Browser Web Push</span>
                {browserPermission === 'granted' ? (
                  <span className="text-[10px] text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded-sm font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-2.5 h-2.5 inline" /> Active
                  </span>
                ) : (
                  <span className="text-[10px] text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded-sm font-semibold">
                    Permission Needed
                  </span>
                )}
              </div>
              <p className="text-[11px] text-[#7C6E65] mt-0.5">
                Get native screen popup alerts whenever new gourmet recipes are published, even when this tab is closed.
              </p>
              {browserPermission !== 'granted' && (
                <button
                  onClick={handleRequestPermission}
                  className="mt-2 px-3 py-1 text-xs font-semibold rounded-lg bg-[#C46836] text-white hover:bg-[#A85427] transition-all shadow-xs cursor-pointer"
                >
                  Enable Instant Alerts
                </button>
              )}
            </div>
          </div>

          {/* Quick Sound Control & Mark Read */}
          <div className="mt-3 pt-3 border-t border-[#DFCEBF] flex items-center justify-between text-xs">
            <button
              onClick={handleToggleSound}
              className="flex items-center gap-1.5 text-[#5E5046] hover:text-[#2D241E] font-medium cursor-pointer"
            >
              {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-[#C46836]" /> : <VolumeX className="w-3.5 h-3.5 text-stone-400" />}
              <span>Chime Audio: {soundEnabled ? 'On' : 'Muted'}</span>
            </button>

            <button
              onClick={onMarkAllRead}
              className="flex items-center gap-1 text-[#8C7A6B] hover:text-[#2D241E] font-medium text-[11px] cursor-pointer"
            >
              <CheckCheck className="w-3 h-3" />
              <span>Mark all read</span>
            </button>
          </div>
        </div>

        {/* Action Button for Authors/Admins */}
        {(currentUser.roles.includes('Author') || currentUser.roles.includes('Admin')) && (
          <div className="px-4 py-3 bg-[#FAF7F2] border-b border-[#E8DFD8]">
            <button
              onClick={onOpenBroadcast}
              className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-[#43362E] hover:bg-[#2D241E] text-white text-xs font-semibold transition-all shadow-xs cursor-pointer"
            >
              <Send className="w-3.5 h-3.5 text-[#C46836]" />
              <span>Broadcast Alert for New Recipe</span>
            </button>
          </div>
        )}

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {notifications.length === 0 ? (
            <div className="py-16 text-center text-[#8C7A6B] space-y-2">
              <Bell className="w-10 h-10 text-[#D5C7BA] mx-auto" />
              <p className="text-sm font-medium text-[#2D241E]">No notifications yet</p>
              <p className="text-xs text-[#8C7A6B]">
                New recipe alerts and culinary highlights will appear here.
              </p>
            </div>
          ) : (
            notifications.map((item) => (
              <div
                key={item.id}
                className={`p-3.5 rounded-2xl border transition-all ${
                  item.read
                    ? 'bg-[#FFFFFF] border-[#E8DFD8]'
                    : 'bg-[#FDFCFA] border-[#D5C7BA] ring-1 ring-[#C46836]/15 shadow-xs'
                }`}
              >
                <div className="flex items-start gap-3">
                  {item.recipeImage ? (
                    <img
                      src={item.recipeImage}
                      alt={item.title}
                      className="w-14 h-14 rounded-xl object-cover ring-1 ring-[#E8DFD8] shrink-0"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-[#F0E6DD] flex items-center justify-center text-[#C46836] shrink-0">
                      <Radio className="w-6 h-6" />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#C46836]">
                        {item.priority === 'urgent' ? 'Hot & Fresh' : 'New Recipe'}
                      </span>
                      <span className="text-[10px] text-[#A6978A] whitespace-nowrap">
                        {formatRelativeTime(item.sentAt)}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-[#2D241E] leading-snug line-clamp-1">
                      {item.title}
                    </h4>

                    <p className="text-[11px] text-[#5E5046] mt-1 line-clamp-2 leading-relaxed">
                      {item.message}
                    </p>

                    <div className="mt-2.5 flex items-center justify-between text-[10px] text-[#8C7A6B]">
                      <span>To: {item.segment}</span>
                      {item.recipeId && (
                        <button
                          onClick={() => {
                            if (item.recipeId) {
                              onSelectRecipe(item.recipeId);
                              onClose();
                            }
                          }}
                          className="font-bold text-[#C46836] hover:text-[#9A461A] inline-flex items-center gap-1 cursor-pointer"
                        >
                          <span>View recipe</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer info */}
        <div className="p-3 bg-[#FAF7F2] border-t border-[#E8DFD8] text-center text-[11px] text-[#8C7A6B]">
          Connected: <span className="font-semibold text-[#2D241E]">1,480 Subscribers Online</span> · Instant Multi-tab Dispatch
        </div>

      </div>
    </div>
  );
};
