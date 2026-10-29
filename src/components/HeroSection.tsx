import React from 'react';
import { Category } from '../types';
import { Search, Sparkles, Send, BellRing, Filter, Clock, Flame } from 'lucide-react';

interface HeroSectionProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  categories: Category[];
  selectedCategoryId: string;
  onSelectCategory: (categoryId: string) => void;
  selectedDifficulty: string;
  onSelectDifficulty: (diff: string) => void;
  maxTime: number;
  onSelectMaxTime: (time: number) => void;
  onOpenBroadcast: () => void;
  onEnablePush: () => void;
  isPushGranted: boolean;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  searchQuery,
  onSearchChange,
  categories,
  selectedCategoryId,
  onSelectCategory,
  selectedDifficulty,
  onSelectDifficulty,
  maxTime,
  onSelectMaxTime,
  onOpenBroadcast,
  onEnablePush,
  isPushGranted,
}) => {
  return (
    <section className="relative overflow-hidden mb-12">
      {/* Editorial Hero Layout */}
      <div className="relative rounded-3xl bg-[#F5EFEB] border border-[#E8DFD8] overflow-hidden p-6 sm:p-10 lg:p-12 shadow-xs">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Text & Controls (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Kicker with push status */}
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
              <span className="text-[#C46836] uppercase tracking-widest font-bold">
                Culinary Magazine & Kitchen Journal
              </span>
              <span aria-hidden="true" className="text-[#D5C7BA]">·</span>
              <button
                onClick={onEnablePush}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs transition-all cursor-pointer ${
                  isPushGranted
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-[#F0E6DD] text-[#63391A] hover:bg-[#E8D9CD]'
                }`}
              >
                <BellRing className="w-3.5 h-3.5 text-[#C46836]" />
                <span>{isPushGranted ? 'Receiving instant dish alerts' : 'Enable push alerts for new dishes'}</span>
              </button>
            </div>

            {/* Display Headline without orphan word wrapping */}
            <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-[#2D241E] leading-tight text-balance">
              Artisanal Flavors & Tested Recipes for Every Home Kitchen
            </h1>

            <p className="text-sm sm:text-base text-[#5E5046] leading-relaxed max-w-xl">
              Explore hundreds of traditional and contemporary recipes curated by passionate culinary masters. Receive instant automated push notifications the moment a fresh recipe is published.
            </p>

            {/* Full-Text Search Input */}
            <div className="relative max-w-xl">
              <Search className="w-5 h-5 text-[#8C7A6B] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search recipes... (e.g. beef pho, glazed salmon, matcha, summer rolls...)"
                className="w-full pl-12 pr-28 py-3.5 rounded-2xl bg-white border border-[#D5C7BA] text-sm text-[#2D241E] shadow-sm placeholder:text-[#A6978A] focus:outline-none focus:ring-2 focus:ring-[#C46836]/50 focus:border-[#C46836]"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-1 text-xs text-[#8C7A6B] hover:text-[#2D241E] bg-[#FAF7F2] rounded-lg border border-[#E8DFD8] cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Interactive Filters: Categories & Time */}
            <div className="space-y-3 pt-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold text-[#8C7A6B] mr-1">Categories:</span>
                <button
                  onClick={() => onSelectCategory('all')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                    selectedCategoryId === 'all'
                      ? 'bg-[#43362E] text-white shadow-xs'
                      : 'bg-white border border-[#D5C7BA] text-[#5E5046] hover:bg-[#F2ECE4]'
                  }`}
                >
                  All Recipes
                </button>
                {categories.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => onSelectCategory(c.id)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                      selectedCategoryId === c.id
                        ? 'bg-[#43362E] text-white shadow-xs'
                        : 'bg-white border border-[#D5C7BA] text-[#5E5046] hover:bg-[#F2ECE4]'
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>

              {/* Secondary Filter Row: Cook Time & Difficulty */}
              <div className="flex flex-wrap items-center gap-3 text-xs text-[#5E5046]">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#C46836]" />
                  <span>Max Time:</span>
                  <select
                    value={maxTime}
                    onChange={(e) => onSelectMaxTime(Number(e.target.value))}
                    className="bg-white border border-[#D5C7BA] rounded-lg px-2 py-1 text-xs focus:outline-none cursor-pointer"
                  >
                    <option value={999}>Any Duration</option>
                    <option value={15}>Under 15 mins (Quick Prep)</option>
                    <option value={30}>Under 30 mins</option>
                    <option value={60}>Under 60 mins</option>
                  </select>
                </div>

                <div className="flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-[#C46836]" />
                  <span>Difficulty:</span>
                  <select
                    value={selectedDifficulty}
                    onChange={(e) => onSelectDifficulty(e.target.value)}
                    className="bg-white border border-[#D5C7BA] rounded-lg px-2 py-1 text-xs focus:outline-none cursor-pointer"
                  >
                    <option value="all">All Difficulties</option>
                    <option value="1">Easy</option>
                    <option value="2">Medium</option>
                    <option value="3">Hard</option>
                    <option value="4">Expert</option>
                  </select>
                </div>
              </div>
            </div>

          </div>

          {/* Right Hero Image (5 cols) */}
          <div className="lg:col-span-5 relative">
            <div className="relative aspect-4/3 lg:aspect-square w-full rounded-3xl overflow-hidden shadow-xl ring-1 ring-[#DFCEBF]">
              <img
                src="/src/assets/images/hero_culinary_spread_1792467735266.jpg"
                alt="Artisanal table spread with traditional dishes in warm beige tones"
                className="w-full h-full object-cover"
              />
              
              {/* Overlay card: Instant notification push spotlight */}
              <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-lg border border-[#DFCEBF] flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#C46836] text-white flex items-center justify-center shrink-0">
                    <Send className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#2D241E]">
                      Automated Instant Push Engine
                    </div>
                    <div className="text-[11px] text-[#7C6E65]">
                      Freshly published dishes alert readers in &lt;100ms
                    </div>
                  </div>
                </div>

                <button
                  onClick={onOpenBroadcast}
                  className="px-3 py-1.5 text-xs font-bold rounded-xl bg-[#43362E] hover:bg-[#2D241E] text-white transition-all shadow-xs shrink-0 cursor-pointer"
                >
                  Send Alert
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
