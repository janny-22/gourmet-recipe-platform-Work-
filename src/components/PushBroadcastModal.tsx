import React, { useState } from 'react';
import { Recipe, ApplicationUser } from '../types';
import { pushNotificationService } from '../services/pushNotificationService';
import { 
  Send, 
  X, 
  BellRing, 
  Users, 
  Flame, 
  Sparkles, 
  CheckCircle2, 
  Smartphone, 
  Radio 
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface PushBroadcastModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipes: Recipe[];
  preSelectedRecipeId?: string;
  currentUser: ApplicationUser;
  onNotificationSent?: () => void;
}

export const PushBroadcastModal: React.FC<PushBroadcastModalProps> = ({
  isOpen,
  onClose,
  recipes,
  preSelectedRecipeId,
  currentUser,
  onNotificationSent,
}) => {
  const publishedRecipes = recipes.filter(r => r.status === 1);
  const initialRecipe = publishedRecipes.find(r => r.id === preSelectedRecipeId) || publishedRecipes[0];

  const [selectedRecipeId, setSelectedRecipeId] = useState<string>(initialRecipe?.id || '');
  const [title, setTitle] = useState<string>(
    initialRecipe ? `🍽️ New Recipe Alert: ${initialRecipe.title}` : '🍽️ Explore a freshly published culinary creation'
  );
  const [message, setMessage] = useState<string>(
    initialRecipe 
      ? `Chef ${currentUser.displayName} just published a new signature recipe: "${initialRecipe.title}". Cooks in ${initialRecipe.cookTime} mins, discover the secret!`
      : 'A brand-new artisanal recipe has just been added to today\'s menu. Step into the kitchen and cook with us!'
  );
  const [priority, setPriority] = useState<'standard' | 'urgent' | 'daily_pick'>('urgent');
  const [segment, setSegment] = useState<string>('All Subscribers');
  const [isSending, setIsSending] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);

  if (!isOpen) return null;

  const currentRecipe = publishedRecipes.find(r => r.id === selectedRecipeId);

  const handleRecipeChange = (recipeId: string) => {
    setSelectedRecipeId(recipeId);
    const r = publishedRecipes.find(item => item.id === recipeId);
    if (r) {
      setTitle(`🍽️ New Recipe Alert: ${r.title}`);
      setMessage(`Chef ${currentUser.displayName} just published a new signature recipe: "${r.title}". Cooks in ${r.cookTime} mins, discover the secret!`);
    }
  };

  const handleSendPush = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;

    setIsSending(true);

    setTimeout(() => {
      pushNotificationService.dispatchPush({
        title,
        message,
        recipeId: currentRecipe?.id,
        recipeSlug: currentRecipe?.slug,
        recipeTitle: currentRecipe?.title,
        recipeImage: currentRecipe?.images.find(img => img.isPrimary)?.originalUrl || currentRecipe?.images[0]?.originalUrl,
        authorName: currentUser.displayName,
        priority,
        segment,
        reachCount: segment === 'All Subscribers' ? 1480 : 420,
      });

      try {
        confetti({
          particleCount: 60,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#C46836', '#43362E', '#D97706', '#E8DFD8'],
        });
      } catch {
        // ignore
      }

      setIsSending(false);
      setSentSuccess(true);

      if (onNotificationSent) {
        onNotificationSent();
      }

      setTimeout(() => {
        setSentSuccess(false);
        onClose();
      }, 1800);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-[#FFFFFF] w-full max-w-2xl rounded-3xl shadow-2xl border border-[#DFCEBF] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-5 bg-[#FAF7F2] border-b border-[#E8DFD8] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#F0E6DD] text-[#C46836] flex items-center justify-center">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="font-serif text-xl font-bold text-[#2D241E]">
                Instant Push Dispatch Center
              </h3>
              <p className="text-xs text-[#7C6E65]">
                Broadcast real-time push alerts to subscribers the moment a new dish is ready
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#A6978A] hover:text-[#2D241E] hover:bg-[#F2ECE4] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {sentSuccess ? (
          <div className="p-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h4 className="font-serif text-2xl font-bold text-[#2D241E]">
              Push Notification Broadcasted!
            </h4>
            <p className="text-sm text-[#7C6E65] max-w-md mx-auto">
              The message was automatically dispatched to <strong>{segment === 'All Subscribers' ? '1,480' : '420'}</strong> active readers across Web Push and open tabs in &lt;85ms.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSendPush} className="p-6 space-y-5">
            {/* Choose Recipe */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#5E5046] mb-1.5">
                Select Recipe to Feature
              </label>
              <select
                value={selectedRecipeId}
                onChange={(e) => handleRecipeChange(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-[#D5C7BA] bg-[#FAF7F2] text-[#2D241E] text-sm focus:outline-none focus:ring-2 focus:ring-[#C46836]/40 focus:border-[#C46836] cursor-pointer"
              >
                {publishedRecipes.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.title} ({r.cookTime} mins · {r.authorName})
                  </option>
                ))}
              </select>
            </div>

            {/* Notification Title */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#5E5046] mb-1.5">
                Push Alert Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-xl border border-[#D5C7BA] bg-[#FFFFFF] text-[#2D241E] text-sm focus:outline-none focus:ring-2 focus:ring-[#C46836]/40 focus:border-[#C46836]"
                placeholder="e.g. 🍽️ New Dish: Hanoi Beef Pho"
              />
            </div>

            {/* Notification Message */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#5E5046] mb-1.5">
                Push Notification Body Message
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                rows={3}
                className="w-full px-4 py-2.5 rounded-xl border border-[#D5C7BA] bg-[#FFFFFF] text-[#2D241E] text-sm focus:outline-none focus:ring-2 focus:ring-[#C46836]/40 focus:border-[#C46836]"
                placeholder="Write an enticing culinary snippet to inspire readers to cook right now..."
              />
            </div>

            {/* Target Segment & Priority */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#5E5046] mb-1.5 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-[#C46836]" />
                  <span>Target Audience Segment</span>
                </label>
                <select
                  value={segment}
                  onChange={(e) => setSegment(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#D5C7BA] bg-[#FAF7F2] text-xs text-[#2D241E] focus:outline-none focus:ring-2 focus:ring-[#C46836]/40 cursor-pointer"
                >
                  <option value="All Subscribers">All Subscribers (~1,480 foodies)</option>
                  <option value="Main Dishes & Banquets">Main Dishes & Banquets (680 foodies)</option>
                  <option value="Desserts & Sweets Lovers">Dessert & Pastry Lovers (420 foodies)</option>
                  <option value="Plant-Based Community">Plant-Based Community (380 foodies)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#5E5046] mb-1.5 flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-[#C46836]" />
                  <span>Broadcast Priority</span>
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setPriority('urgent')}
                    className={`flex-1 py-2 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                      priority === 'urgent'
                        ? 'bg-[#C46836] text-white border-[#C46836]'
                        : 'bg-[#FAF7F2] text-[#5E5046] border-[#D5C7BA] hover:bg-[#F2ECE4]'
                    }`}
                  >
                    Fresh Out / Urgent
                  </button>
                  <button
                    type="button"
                    onClick={() => setPriority('daily_pick')}
                    className={`flex-1 py-2 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                      priority === 'daily_pick'
                        ? 'bg-[#43362E] text-white border-[#43362E]'
                        : 'bg-[#FAF7F2] text-[#5E5046] border-[#D5C7BA] hover:bg-[#F2ECE4]'
                    }`}
                  >
                    Daily Chef's Pick
                  </button>
                </div>
              </div>
            </div>

            {/* Live Preview of Push Card */}
            <div className="p-4 rounded-2xl bg-[#F7F3EE] border border-[#E8DFD8]">
              <div className="flex items-center justify-between text-xs font-semibold text-[#8C7A6B] mb-2">
                <span className="flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5" />
                  Live Notification Preview on Reader's Screen
                </span>
                <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Latency: Instant (&lt;85ms)
                </span>
              </div>
              <div className="bg-white rounded-xl p-3 shadow-xs border border-[#DFCEBF] flex items-start gap-3">
                {currentRecipe?.images[0]?.originalUrl ? (
                  <img
                    src={currentRecipe.images[0].originalUrl}
                    alt={currentRecipe.title}
                    className="w-12 h-12 rounded-lg object-cover ring-1 ring-[#E8DFD8] shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-[#FAF7F2] flex items-center justify-center text-[#C46836] shrink-0">
                    <Radio className="w-6 h-6" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-[#2D241E] truncate">
                    {title || 'Push Alert Title'}
                  </div>
                  <div className="text-[11px] text-[#5E5046] line-clamp-2 mt-0.5">
                    {message || 'The alert body text will appear here...'}
                  </div>
                  <div className="text-[10px] text-[#A6978A] mt-1">
                    Culinary Blog · by {currentUser.displayName}
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#F2ECE4]">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-[#7C6E65] hover:text-[#2D241E] hover:bg-[#F2ECE4] rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSending}
                className="flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-[#C46836] hover:bg-[#A85427] rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-50 cursor-pointer"
              >
                {isSending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Broadcasting to 1,480 devices...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Send Push Notification Immediately</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
