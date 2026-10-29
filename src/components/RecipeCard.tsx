import React from 'react';
import { Recipe, Category } from '../types';
import { formatMinutes, getDifficultyLabel } from '../utils/textUtils';
import { Clock, Users, Heart, Eye, ChefHat, Sparkles } from 'lucide-react';

interface RecipeCardProps {
  recipe: Recipe;
  categories: Category[];
  onSelect: (recipe: Recipe) => void;
  onCookNow?: (recipe: Recipe) => void;
  isOwnerOrAdmin?: boolean;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({
  recipe,
  categories,
  onSelect,
  onCookNow,
  isOwnerOrAdmin = false,
}) => {
  const category = categories.find((c) => c.id === recipe.categoryId);
  const primaryImage = recipe.images.find((img) => img.isPrimary)?.originalUrl || recipe.images[0]?.originalUrl;
  const diff = getDifficultyLabel(recipe.difficulty);

  return (
    <article 
      onClick={() => onSelect(recipe)}
      className="group bg-[#FFFFFF] rounded-2xl overflow-hidden border border-[#E8DFD8] hover:border-[#D5C7BA] hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col h-full"
    >
      {/* Recipe Image Container (65-70% visual prominence) */}
      <div className="relative aspect-4/3 w-full overflow-hidden bg-[#F2ECE4]">
        {primaryImage ? (
          <img
            src={primaryImage}
            alt={recipe.title}
            className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-[#F7F3EE] text-[#8C7A6B]">
            <ChefHat className="w-12 h-12 stroke-[1.5]" />
          </div>
        )}

        {/* Top Floating Info: Status for author or category kicker */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          {category && (
            <span className="text-[11px] font-semibold text-white/95 px-2.5 py-1 rounded-lg bg-black/40 backdrop-blur-xs shadow-xs">
              {category.name}
            </span>
          )}

          {isOwnerOrAdmin && recipe.status !== 1 && (
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
              recipe.status === 0 ? 'bg-amber-500 text-white' : 'bg-stone-600 text-white'
            }`}>
              {recipe.status === 0 ? 'Draft' : 'Archived'}
            </span>
          )}
        </div>

        {/* Cooking quick button overlay on hover */}
        {onCookNow && (
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-4">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onCookNow(recipe);
              }}
              className="px-4 py-2 rounded-xl bg-white/95 hover:bg-white text-[#2D241E] text-xs font-bold shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <ChefHat className="w-4 h-4 text-[#C46836]" />
              <span>Start Cooking Now</span>
            </button>
          </div>
        )}
      </div>

      {/* Card Content Area */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Zero-Pill Unboxed Metadata with · separator */}
          <div className="flex items-center gap-2 text-xs text-[#8C7A6B] mb-2 font-medium">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span className="tabular-nums">{formatMinutes(recipe.prepTime + recipe.cookTime)}</span>
            </span>
            <span aria-hidden="true">·</span>
            <span>{diff.label}</span>
            <span aria-hidden="true">·</span>
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              <span className="tabular-nums">{recipe.servings} servings</span>
            </span>
          </div>

          {/* Title */}
          <h3 className="font-serif text-lg font-bold text-[#2D241E] group-hover:text-[#C46836] transition-colors line-clamp-2 leading-snug">
            {recipe.title}
          </h3>

          {/* Description snippet */}
          <p className="text-xs text-[#7C6E65] mt-1.5 line-clamp-2 leading-relaxed">
            {recipe.description}
          </p>
        </div>

        {/* Footer: Author & Stats */}
        <div className="mt-4 pt-3 border-t border-[#F2ECE4] flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <img
              src={recipe.authorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80'}
              alt={recipe.authorName}
              className="w-6 h-6 rounded-full object-cover ring-1 ring-[#D5C7BA]"
            />
            <span className="font-medium text-[#43362E] truncate max-w-[140px]">
              {recipe.authorName}
            </span>
          </div>

          <div className="flex items-center gap-3 text-[#A6978A] tabular-nums text-[11px]">
            {recipe.viewsCount && (
              <span className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                <span>{recipe.viewsCount}</span>
              </span>
            )}
            {recipe.likesCount && (
              <span className="flex items-center gap-1">
                <Heart className="w-3 h-3 text-[#C46836]/70" />
                <span>{recipe.likesCount}</span>
              </span>
            )}
          </div>
        </div>
      </div>
    </article>
  );
};
