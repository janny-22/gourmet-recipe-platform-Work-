import React, { useEffect, useState } from 'react';
import { PushNotification } from '../types';
import { pushNotificationService } from '../services/pushNotificationService';
import { X, ExternalLink, Radio } from 'lucide-react';

interface LivePushToastProps {
  onSelectRecipe: (recipeId: string) => void;
}

export const LivePushToast: React.FC<LivePushToastProps> = ({ onSelectRecipe }) => {
  const [activeToast, setActiveToast] = useState<PushNotification | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    const unsubscribe = pushNotificationService.subscribe((notification) => {
      setActiveToast(notification);
      setVisible(true);

      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        setVisible(false);
      }, 8000);
    });

    return () => {
      if (timer) clearTimeout(timer);
      unsubscribe();
    };
  }, []);

  if (!activeToast || !visible) return null;

  return (
    <aside 
      aria-label="Instant push notification alert"
      className="fixed bottom-6 right-6 z-50 max-w-md w-full animate-in fade-in slide-in-from-bottom-5 duration-300 pointer-events-auto"
    >
      <div className="bg-[#FFFFFF] rounded-2xl p-4 shadow-2xl border border-[#DFCEBF] ring-1 ring-[#C46836]/20">
        <div className="flex items-start gap-3.5">
          {/* Recipe Thumbnail */}
          {activeToast.recipeImage ? (
            <img
              src={activeToast.recipeImage}
              alt={activeToast.recipeTitle || 'New Recipe'}
              className="w-16 h-16 rounded-xl object-cover shrink-0 ring-1 ring-[#E8DFD8]"
            />
          ) : (
            <div className="w-16 h-16 rounded-xl bg-[#F0E6DD] flex items-center justify-center shrink-0 text-[#C46836]">
              <Radio className="w-7 h-7" />
            </div>
          )}

          {/* Content */}
          <div className="flex-1 min-w-0 pr-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#C46836] flex items-center gap-1">
                <Radio className="w-3 h-3 text-[#C46836] animate-pulse" />
                Instant Push Alert
              </span>
              <span className="text-[11px] text-[#A6978A]">· just now</span>
            </div>

            <h4 className="text-sm font-bold text-[#2D241E] leading-snug line-clamp-1">
              {activeToast.title}
            </h4>

            <p className="text-xs text-[#5E5046] mt-1 line-clamp-2 leading-relaxed">
              {activeToast.message}
            </p>

            <div className="mt-3 flex items-center gap-2">
              {activeToast.recipeId && (
                <button
                  onClick={() => {
                    if (activeToast.recipeId) {
                      onSelectRecipe(activeToast.recipeId);
                    }
                    setVisible(false);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#43362E] text-white hover:bg-[#2D241E] transition-colors shadow-xs cursor-pointer"
                >
                  <span>View Recipe</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              )}
              <button
                onClick={() => setVisible(false)}
                className="px-2.5 py-1.5 text-xs font-medium text-[#7C6E65] hover:text-[#2D241E] hover:bg-[#F2ECE4] rounded-lg transition-colors cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          </div>

          {/* Close button */}
          <button
            onClick={() => setVisible(false)}
            className="text-[#A6978A] hover:text-[#2D241E] p-1 rounded-lg hover:bg-[#F2ECE4] transition-colors shrink-0 cursor-pointer"
            aria-label="Dismiss notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
