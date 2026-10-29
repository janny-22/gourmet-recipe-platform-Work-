import React, { useState } from 'react';
import { Category, Recipe, ApplicationUser } from '../types';
import { RecipeCard } from './RecipeCard';
import { Plus, ChefHat, X } from 'lucide-react';

interface CategoriesViewProps {
  categories: Category[];
  recipes: Recipe[];
  onSelectRecipe: (recipe: Recipe) => void;
  currentUser: ApplicationUser;
  onAddCategory: (category: Omit<Category, 'id' | 'recipeCount'>) => void;
}

export const CategoriesView: React.FC<CategoriesViewProps> = ({
  categories,
  recipes,
  onSelectRecipe,
  currentUser,
  onAddCategory,
}) => {
  const [selectedCategorySlug, setSelectedCategorySlug] = useState<string>(categories[0]?.slug || '');
  const [showNewCatModal, setShowNewCatModal] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');

  const isAdmin = currentUser.roles.includes('Admin');
  const activeCategory = categories.find((c) => c.slug === selectedCategorySlug) || categories[0];
  const activeRecipes = recipes.filter((r) => r.categoryId === activeCategory?.id && r.status === 1);

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    const slug = newCatName
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-');

    onAddCategory({
      name: newCatName,
      slug,
      description: newCatDesc,
      orderIndex: categories.length + 1,
    });

    setNewCatName('');
    setNewCatDesc('');
    setShowNewCatModal(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* Category Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#C46836]">
            Culinary Collections
          </span>
          <h2 className="font-serif text-3xl font-bold text-[#2D241E] mt-1">
            Browse by Category
          </h2>
          <p className="text-xs text-[#7C6E65] mt-1">
            Explore curated recipes across signature mains, fresh starters, artisanal desserts, and teas
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => setShowNewCatModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#43362E] hover:bg-[#2D241E] rounded-xl transition-all shadow-xs shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Category (Admin)</span>
          </button>
        )}
      </div>

      {/* Category Pills Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {categories.map((cat) => {
          const isSelected = cat.slug === activeCategory?.slug;
          const count = recipes.filter((r) => r.categoryId === cat.id && r.status === 1).length;

          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategorySlug(cat.slug)}
              className={`p-4 rounded-2xl text-left border transition-all cursor-pointer ${
                isSelected
                  ? 'bg-[#43362E] text-white border-[#43362E] shadow-md'
                  : 'bg-white text-[#2D241E] border-[#E8DFD8] hover:border-[#D5C7BA] hover:bg-[#FAF7F2]'
              }`}
            >
              <div className="font-serif text-base font-bold truncate">
                {cat.name}
              </div>
              <div className={`text-xs mt-1 tabular-nums ${isSelected ? 'text-[#D5C7BA]' : 'text-[#8C7A6B]'}`}>
                {count} {count === 1 ? 'recipe' : 'recipes'} published
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Category Details & Recipes Grid */}
      {activeCategory && (
        <div className="space-y-6 pt-4">
          <div className="p-6 rounded-3xl bg-[#F7F3EE] border border-[#E8DFD8] flex items-center justify-between">
            <div>
              <h3 className="font-serif text-2xl font-bold text-[#2D241E]">
                {activeCategory.name}
              </h3>
              <p className="text-xs text-[#5E5046] mt-1 max-w-xl">
                {activeCategory.description || 'Curated recipes in this category.'}
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs text-[#8C7A6B]">Total Recipes:</span>
              <div className="font-serif text-xl font-bold text-[#C46836] tabular-nums">
                {activeRecipes.length} {activeRecipes.length === 1 ? 'dish' : 'dishes'}
              </div>
            </div>
          </div>

          {activeRecipes.length === 0 ? (
            <div className="p-16 text-center text-[#8C7A6B] bg-white rounded-3xl border border-[#E8DFD8]">
              <ChefHat className="w-12 h-12 text-[#D5C7BA] mx-auto mb-2" />
              <p className="text-sm font-semibold text-[#2D241E]">No recipes published in this category yet</p>
              <p className="text-xs text-[#7C6E65] mt-1">
                Be the first to create and publish a recipe for {activeCategory.name}!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeRecipes.map((r) => (
                <RecipeCard
                  key={r.id}
                  recipe={r}
                  categories={categories}
                  onSelect={onSelectRecipe}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* New Category Modal (FR-CAT-003) */}
      {showNewCatModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl border border-[#DFCEBF] space-y-4">
            <div className="flex items-center justify-between border-b border-[#F2ECE4] pb-3">
              <h3 className="font-serif text-lg font-bold text-[#2D241E]">
                Create New Category
              </h3>
              <button
                onClick={() => setShowNewCatModal(false)}
                className="p-1.5 rounded-lg text-[#8C7A6B] hover:text-[#2D241E] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCategory} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#5E5046] mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="e.g. Artisanal Breads & Baking"
                  className="w-full px-3.5 py-2 rounded-xl border border-[#D5C7BA] text-sm focus:outline-none focus:ring-2 focus:ring-[#C46836]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#5E5046] mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={newCatDesc}
                  onChange={(e) => setNewCatDesc(e.target.value)}
                  placeholder="Brief culinary focus for this collection..."
                  className="w-full px-3.5 py-2 rounded-xl border border-[#D5C7BA] text-sm focus:outline-none focus:ring-2 focus:ring-[#C46836]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewCatModal(false)}
                  className="px-3 py-1.5 text-xs text-[#7C6E65] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-[#43362E] hover:bg-[#2D241E] rounded-xl cursor-pointer"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
