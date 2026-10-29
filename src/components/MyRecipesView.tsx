import React, { useState } from 'react';
import { Recipe, Category, ApplicationUser, RecipeStatus } from '../types';
import { formatMinutes, getDifficultyLabel, formatDateVN } from '../utils/textUtils';
import { 
  Plus, 
  Send, 
  Edit, 
  Trash2, 
  Archive, 
  ChefHat
} from 'lucide-react';

interface MyRecipesViewProps {
  recipes: Recipe[];
  categories: Category[];
  currentUser: ApplicationUser;
  onSelectRecipe: (recipe: Recipe) => void;
  onOpenNewRecipe: () => void;
  onEditRecipe: (recipe: Recipe) => void;
  onTogglePublish: (recipe: Recipe) => void;
  onArchiveRecipe: (recipe: Recipe) => void;
  onDeleteRecipe: (recipeId: string) => void;
  onOpenBroadcastForRecipe: (recipeId: string) => void;
}

export const MyRecipesView: React.FC<MyRecipesViewProps> = ({
  recipes,
  categories,
  currentUser,
  onSelectRecipe,
  onOpenNewRecipe,
  onEditRecipe,
  onTogglePublish,
  onArchiveRecipe,
  onDeleteRecipe,
  onOpenBroadcastForRecipe,
}) => {
  const [statusFilter, setStatusFilter] = useState<'all' | RecipeStatus>('all');

  const isAdmin = currentUser.roles.includes('Admin');
  // If admin, can see all recipes; if author, sees their own recipes (FR-RCP-001)
  const myRecipes = isAdmin
    ? recipes
    : recipes.filter((r) => r.authorId === currentUser.id);

  const filteredRecipes = statusFilter === 'all'
    ? myRecipes
    : myRecipes.filter((r) => r.status === statusFilter);

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* Top Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#FFFFFF] border border-[#E8DFD8] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#C46836]">
            <ChefHat className="w-4 h-4" />
            <span>Kitchen & Recipe Studio</span>
          </div>
          <h2 className="font-serif text-3xl font-bold text-[#2D241E] mt-1">
            Recipes by {currentUser.displayName}
          </h2>
          <p className="text-xs text-[#7C6E65] mt-1">
            {isAdmin 
              ? 'Administrator Mode: Manage and oversee all recipes in the system' 
              : 'Draft, publish, and broadcast culinary creations directly to your subscribers'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenNewRecipe}
            className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-white bg-[#43362E] hover:bg-[#2D241E] rounded-xl transition-all shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Recipe</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-[#E8DFD8] pb-3 text-xs font-semibold">
        <button
          onClick={() => setStatusFilter('all')}
          className={`px-3 py-1.5 rounded-xl transition-colors cursor-pointer ${
            statusFilter === 'all' ? 'bg-[#43362E] text-white' : 'text-[#7C6E65] hover:bg-[#F2ECE4]'
          }`}
        >
          All ({myRecipes.length})
        </button>
        <button
          onClick={() => setStatusFilter(1)}
          className={`px-3 py-1.5 rounded-xl transition-colors cursor-pointer ${
            statusFilter === 1 ? 'bg-[#43362E] text-white' : 'text-[#7C6E65] hover:bg-[#F2ECE4]'
          }`}
        >
          Published ({myRecipes.filter((r) => r.status === 1).length})
        </button>
        <button
          onClick={() => setStatusFilter(0)}
          className={`px-3 py-1.5 rounded-xl transition-colors cursor-pointer ${
            statusFilter === 0 ? 'bg-[#43362E] text-white' : 'text-[#7C6E65] hover:bg-[#F2ECE4]'
          }`}
        >
          Drafts ({myRecipes.filter((r) => r.status === 0).length})
        </button>
        <button
          onClick={() => setStatusFilter(2)}
          className={`px-3 py-1.5 rounded-xl transition-colors cursor-pointer ${
            statusFilter === 2 ? 'bg-[#43362E] text-white' : 'text-[#7C6E65] hover:bg-[#F2ECE4]'
          }`}
        >
          Archived ({myRecipes.filter((r) => r.status === 2).length})
        </button>
      </div>

      {/* Recipes List Table or Grid */}
      {filteredRecipes.length === 0 ? (
        <div className="p-16 text-center text-[#8C7A6B] bg-white rounded-3xl border border-[#E8DFD8]">
          <ChefHat className="w-12 h-12 text-[#D5C7BA] mx-auto mb-2" />
          <p className="text-sm font-semibold text-[#2D241E]">No recipes found under this filter</p>
          <button
            onClick={onOpenNewRecipe}
            className="mt-4 px-4 py-2 text-xs font-bold text-white bg-[#C46836] rounded-xl hover:bg-[#A85427] cursor-pointer"
          >
            Create Recipe Now
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRecipes.map((recipe) => {
            const cat = categories.find((c) => c.id === recipe.categoryId);
            const diff = getDifficultyLabel(recipe.difficulty);
            const img = recipe.images.find((i) => i.isPrimary)?.originalUrl || recipe.images[0]?.originalUrl;

            return (
              <div
                key={recipe.id}
                className="p-5 rounded-2xl bg-white border border-[#E8DFD8] hover:border-[#D5C7BA] transition-all flex flex-col md:flex-row md:items-center justify-between gap-5 shadow-2xs"
              >
                {/* Left: Thumbnail & Main Info */}
                <div 
                  onClick={() => onSelectRecipe(recipe)}
                  className="flex items-start gap-4 cursor-pointer flex-1 min-w-0"
                >
                  <img
                    src={img}
                    alt={recipe.title}
                    className="w-20 h-20 rounded-xl object-cover ring-1 ring-[#E8DFD8] shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 text-xs">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        recipe.status === 1
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : recipe.status === 0
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-stone-100 text-stone-700'
                      }`}>
                        {recipe.status === 1 ? 'Published' : recipe.status === 0 ? 'Draft' : 'Archived'}
                      </span>
                      <span className="text-[#8C7A6B]">·</span>
                      <span className="text-[#8C7A6B] font-medium">{cat?.name}</span>
                      <span className="text-[#8C7A6B]">·</span>
                      <span className="text-[#A6978A]">{formatDateVN(recipe.createdAt)}</span>
                    </div>

                    <h3 className="font-serif text-base font-bold text-[#2D241E] hover:text-[#C46836] transition-colors truncate">
                      {recipe.title}
                    </h3>

                    <div className="flex items-center gap-3 text-xs text-[#7C6E65] mt-1.5 tabular-nums">
                      <span>Cook: {formatMinutes(recipe.cookTime)}</span>
                      <span aria-hidden="true">·</span>
                      <span>{diff.label}</span>
                      <span aria-hidden="true">·</span>
                      <span>{recipe.ingredients.length} ingredients</span>
                      <span aria-hidden="true">·</span>
                      <span>{recipe.steps.length} steps</span>
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 shrink-0 border-t md:border-t-0 pt-3 md:pt-0 border-[#F2ECE4]">
                  {/* Push button if published */}
                  {recipe.status === 1 && (
                    <button
                      onClick={() => onOpenBroadcastForRecipe(recipe.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F0E6DD] text-[#63391A] hover:bg-[#E8D9CD] text-xs font-semibold transition-all border border-[#DFCEBF] cursor-pointer"
                      title="Broadcast instant push notification for this recipe"
                    >
                      <Send className="w-3.5 h-3.5 text-[#C46836]" />
                      <span>Push Alert</span>
                    </button>
                  )}

                  {/* Toggle publish button */}
                  <button
                    onClick={() => onTogglePublish(recipe)}
                    className="px-3 py-1.5 rounded-xl bg-[#FAF7F2] text-[#43362E] hover:bg-[#F2ECE4] text-xs font-semibold border border-[#D5C7BA] transition-colors cursor-pointer"
                  >
                    {recipe.status === 1 ? 'Move to Draft' : 'Publish'}
                  </button>

                  {/* Edit button */}
                  <button
                    onClick={() => onEditRecipe(recipe)}
                    className="p-2 text-[#7C6E65] hover:text-[#2D241E] hover:bg-[#F2ECE4] rounded-xl transition-colors cursor-pointer"
                    title="Edit Recipe"
                  >
                    <Edit className="w-4 h-4" />
                  </button>

                  {/* Archive button */}
                  <button
                    onClick={() => onArchiveRecipe(recipe)}
                    className="p-2 text-[#7C6E65] hover:text-[#2D241E] hover:bg-[#F2ECE4] rounded-xl transition-colors cursor-pointer"
                    title="Archive Recipe"
                  >
                    <Archive className="w-4 h-4" />
                  </button>

                  {/* Delete button */}
                  <button
                    onClick={() => {
                      if (window.confirm(`Are you sure you want to permanently delete "${recipe.title}"?`)) {
                        onDeleteRecipe(recipe.id);
                      }
                    }}
                    className="p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                    title="Delete Recipe"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
