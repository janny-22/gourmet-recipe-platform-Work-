import React, { useState } from 'react';
import { ApplicationUser } from '../types';
import { 
  Bell, 
  Send, 
  Plus, 
  ChefHat, 
  ShieldCheck, 
  Volume2, 
  VolumeX 
} from 'lucide-react';
import { soundEffects } from '../services/soundEffects';

interface HeaderProps {
  currentUser: ApplicationUser;
  onSwitchUser: (user: ApplicationUser) => void;
  availableUsers: ApplicationUser[];
  unreadCount: number;
  onOpenNotifications: () => void;
  onOpenBroadcast: () => void;
  onOpenNewRecipe: () => void;
  activeTab: 'explore' | 'categories' | 'my-recipes' | 'push-center';
  setActiveTab: (tab: 'explore' | 'categories' | 'my-recipes' | 'push-center') => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  onSwitchUser,
  availableUsers,
  unreadCount,
  onOpenNotifications,
  onOpenBroadcast,
  onOpenNewRecipe,
  activeTab,
  setActiveTab,
}) => {
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [soundOn, setSoundOn] = useState(soundEffects.isSoundEnabled());

  const toggleSound = () => {
    const next = !soundOn;
    soundEffects.setSoundEnabled(next);
    setSoundOn(next);
    if (next) soundEffects.playPushNotificationChime();
  };

  const isAuthorOrAdmin = currentUser.roles.includes('Author') || currentUser.roles.includes('Admin');

  return (
    <header className="sticky top-0 z-40 bg-[#FAF7F2]/95 backdrop-blur-md border-b border-[#E8DFD8] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-8">
          
          {/* ZONE 1: BRAND TITLE (Wordmark display face, single line) */}
          <div className="flex items-center gap-3 shrink-0">
            <button 
              onClick={() => setActiveTab('explore')}
              className="text-left group flex items-center gap-2.5 focus:outline-none cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-[#43362E] text-[#F5EFEB] flex items-center justify-center shadow-sm group-hover:bg-[#C46836] transition-colors">
                <ChefHat className="w-5 h-5" />
              </div>
              <div>
                <span className="font-serif text-2xl font-bold tracking-tight text-[#2D241E] group-hover:text-[#C46836] transition-colors block leading-none">
                  Culinary Blog
                </span>
                <span className="text-[11px] font-medium tracking-wider uppercase text-[#8C7A6B] block mt-1">
                  Artisanal Kitchen & Recipes
                </span>
              </div>
            </button>
          </div>

          {/* ZONE 2: 4-5 CONCISE SINGLE-LINE NAVIGATION LINKS */}
          <nav className="hidden md:flex items-center gap-7 text-[14px] font-medium text-[#5E5046]">
            <button
              onClick={() => setActiveTab('explore')}
              className={`whitespace-nowrap transition-colors relative py-1 hover:text-[#2D241E] cursor-pointer ${
                activeTab === 'explore' ? 'text-[#2D241E] font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-[#C46836]' : ''
              }`}
            >
              Explore Recipes
            </button>
            <button
              onClick={() => setActiveTab('categories')}
              className={`whitespace-nowrap transition-colors relative py-1 hover:text-[#2D241E] cursor-pointer ${
                activeTab === 'categories' ? 'text-[#2D241E] font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-[#C46836]' : ''
              }`}
            >
              Collections & Categories
            </button>
            <button
              onClick={() => setActiveTab('my-recipes')}
              className={`whitespace-nowrap transition-colors relative py-1 hover:text-[#2D241E] cursor-pointer ${
                activeTab === 'my-recipes' ? 'text-[#2D241E] font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-[#C46836]' : ''
              }`}
            >
              My Kitchen
            </button>
            <button
              onClick={() => setActiveTab('push-center')}
              className={`whitespace-nowrap flex items-center gap-1.5 transition-colors relative py-1 hover:text-[#2D241E] cursor-pointer ${
                activeTab === 'push-center' ? 'text-[#2D241E] font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-[#C46836]' : ''
              }`}
            >
              <Send className="w-3.5 h-3.5 text-[#C46836]" />
              <span>Instant Push Hub</span>
            </button>
          </nav>

          {/* ZONE 3: ACTIONS & USER PROFILE */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Sound toggle button */}
            <button
              onClick={toggleSound}
              title={soundOn ? 'Notification sound: ON' : 'Notification sound: MUTED'}
              className="p-2 rounded-xl text-[#7C6E65] hover:text-[#2D241E] hover:bg-[#F2ECE4] transition-colors cursor-pointer"
              aria-label="Toggle chime audio"
            >
              {soundOn ? <Volume2 className="w-4 h-4 text-[#C46836]" /> : <VolumeX className="w-4 h-4 text-stone-400" />}
            </button>

            {/* Instant Broadcast Button */}
            <button
              onClick={onOpenBroadcast}
              className="hidden lg:flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl bg-[#F0E6DD] text-[#63391A] hover:bg-[#E8D9CD] transition-all border border-[#DFCEBF] shadow-xs cursor-pointer"
              title="Broadcast instant push alert to all subscribers when a new recipe is ready"
            >
              <Send className="w-3.5 h-3.5 text-[#C46836]" />
              <span className="whitespace-nowrap">Instant Push</span>
            </button>

            {/* Notification Bell with unread count */}
            <button
              onClick={onOpenNotifications}
              className="relative p-2.5 rounded-xl text-[#43362E] hover:bg-[#F2ECE4] transition-colors focus:outline-none cursor-pointer"
              aria-label="Notification center"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-4 min-w-4 px-1 items-center justify-center text-[10px] font-bold text-white bg-[#C46836] rounded-full ring-2 ring-[#FAF7F2] animate-pulse">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Primary Action Button: Post Recipe */}
            {isAuthorOrAdmin ? (
              <button
                onClick={onOpenNewRecipe}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#43362E] hover:bg-[#2D241E] rounded-xl transition-all shadow-xs hover:shadow whitespace-nowrap cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Post New Recipe</span>
              </button>
            ) : null}

            {/* User Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-[#F2ECE4] transition-colors text-left focus:outline-none border border-transparent hover:border-[#E8DFD8] cursor-pointer"
                aria-expanded={showUserDropdown}
              >
                <img
                  src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80'}
                  alt={currentUser.displayName}
                  className="w-8 h-8 rounded-full object-cover ring-1 ring-[#D5C7BA]"
                />
                <div className="hidden sm:block text-left">
                  <div className="text-xs font-semibold text-[#2D241E] leading-tight">
                    {currentUser.displayName}
                  </div>
                  <div className="text-[10px] text-[#8C7A6B]">
                    {currentUser.roles.join(', ')}
                  </div>
                </div>
              </button>

              {showUserDropdown && (
                <div className="absolute right-0 mt-2 w-72 bg-[#FFFFFF] rounded-2xl shadow-xl border border-[#E8DFD8] p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-3 py-2 border-b border-[#F2ECE4]">
                    <div className="text-xs font-bold uppercase tracking-wider text-[#8C7A6B]">
                      Switch User Role (SRS)
                    </div>
                    <div className="text-[11px] text-[#A6978A] mt-0.5">
                      Test permissions as Guest, Author, or Administrator
                    </div>
                  </div>

                  <div className="py-1 space-y-1">
                    {availableUsers.map((user) => {
                      const isSelected = user.id === currentUser.id;
                      return (
                        <button
                          key={user.id}
                          onClick={() => {
                            onSwitchUser(user);
                            setShowUserDropdown(false);
                          }}
                          className={`w-full flex items-center gap-3 p-2 rounded-xl text-left transition-colors cursor-pointer ${
                            isSelected ? 'bg-[#F7F3EE] text-[#2D241E]' : 'hover:bg-[#FAF7F2] text-[#5E5046]'
                          }`}
                        >
                          <img
                            src={user.avatarUrl}
                            alt={user.displayName}
                            className="w-8 h-8 rounded-full object-cover ring-1 ring-[#D5C7BA]"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-semibold truncate flex items-center gap-1.5">
                              <span>{user.displayName}</span>
                              {user.roles.includes('Admin') && (
                                <ShieldCheck className="w-3.5 h-3.5 text-amber-600 inline" />
                              )}
                              {user.roles.includes('Author') && !user.roles.includes('Admin') && (
                                <ChefHat className="w-3.5 h-3.5 text-[#C46836] inline" />
                              )}
                            </div>
                            <div className="text-[11px] text-[#8C7A6B] truncate">
                              {user.roles.join(' · ')} · {user.email}
                            </div>
                          </div>
                          {isSelected && (
                            <span className="w-2 h-2 rounded-full bg-[#C46836]"></span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>

        {/* Mobile secondary link strip */}
        <div className="flex md:hidden overflow-x-auto py-2.5 gap-4 border-t border-[#F2ECE4] text-xs font-medium text-[#5E5046]">
          <button
            onClick={() => setActiveTab('explore')}
            className={`whitespace-nowrap shrink-0 ${activeTab === 'explore' ? 'text-[#C46836] font-bold' : ''}`}
          >
            Explore
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`whitespace-nowrap shrink-0 ${activeTab === 'categories' ? 'text-[#C46836] font-bold' : ''}`}
          >
            Categories
          </button>
          <button
            onClick={() => setActiveTab('my-recipes')}
            className={`whitespace-nowrap shrink-0 ${activeTab === 'my-recipes' ? 'text-[#C46836] font-bold' : ''}`}
          >
            My Kitchen
          </button>
          <button
            onClick={() => setActiveTab('push-center')}
            className={`whitespace-nowrap shrink-0 flex items-center gap-1 ${activeTab === 'push-center' ? 'text-[#C46836] font-bold' : ''}`}
          >
            <Send className="w-3 h-3 text-[#C46836]" />
            <span>Push Hub</span>
          </button>
        </div>

      </div>
    </header>
  );
};
