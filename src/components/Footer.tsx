import React from 'react';
import { ChefHat, Send } from 'lucide-react';

interface FooterProps {
  onOpenBroadcast: () => void;
  onOpenNotifications: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenBroadcast, onOpenNotifications }) => {
  return (
    <footer className="mt-20 border-t border-[#E8DFD8] bg-[#FAF7F2] py-12 text-[#7C6E65]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#43362E] text-white flex items-center justify-center">
              <ChefHat className="w-4 h-4 text-[#C46836]" />
            </div>
            <div>
              <span className="font-serif text-lg font-bold text-[#2D241E]">
                Culinary Blog
              </span>
              <span className="text-xs text-[#8C7A6B] block">
                IEEE 830 / ISO 29148:2018 Compliant Specification · Version 1.0.0
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs font-medium text-[#5E5046]">
            <button
              onClick={onOpenNotifications}
              className="hover:text-[#2D241E] transition-colors cursor-pointer"
            >
              Notification Inbox
            </button>
            <button
              onClick={onOpenBroadcast}
              className="hover:text-[#2D241E] transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Send className="w-3 h-3 text-[#C46836]" />
              <span>Broadcast New Recipe Alert</span>
            </button>
            <a href="#privacy" className="hover:text-[#2D241E] transition-colors">
              Privacy Policy
            </a>
            <a href="#terms" className="hover:text-[#2D241E] transition-colors">
              Terms & Culinary Standards
            </a>
          </div>

          <div className="text-xs text-[#A6978A] flex items-center gap-1">
            <span>Crafted for home cooks and culinary artisans</span>
          </div>

        </div>
      </div>
    </footer>
  );
};
