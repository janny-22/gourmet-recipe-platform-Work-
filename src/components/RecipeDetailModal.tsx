import React, { useState } from 'react';
import { Recipe, Category, ApplicationUser } from '../types';
import { formatMinutes, getDifficultyLabel, formatDateVN } from '../utils/textUtils';
import { soundEffects } from '../services/soundEffects';
import { 
  X, 
  Clock, 
  Users, 
  ChefHat, 
  Check, 
  Play, 
  Pause, 
  RotateCcw, 
  Send, 
  Sparkles, 
  Heart, 
  Share2, 
  Flame, 
  ShieldCheck, 
  Code,
  Edit,
  Trash2,
  Archive,
  BookOpen
} from 'lucide-react';

interface RecipeDetailModalProps {
  recipe: Recipe | null;
  onClose: () => void;
  categories: Category[];
  currentUser: ApplicationUser;
  onStartCookingMode: (recipe: Recipe) => void;
  onOpenBroadcastForRecipe: (recipeId: string) => void;
  onEditRecipe?: (recipe: Recipe) => void;
  onTogglePublish?: (recipe: Recipe) => void;
  onArchiveRecipe?: (recipe: Recipe) => void;
  onDeleteRecipe?: (recipeId: string) => void;
}

export const RecipeDetailModal: React.FC<RecipeDetailModalProps> = ({
  recipe,
  onClose,
  categories,
  currentUser,
  onStartCookingMode,
  onOpenBroadcastForRecipe,
  onEditRecipe,
  onTogglePublish,
  onArchiveRecipe,
  onDeleteRecipe,
}) => {
  if (!recipe) return null;

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [servings, setServings] = useState(recipe.servings || 4);
  const [checkedIngredients, setCheckedIngredients] = useState<Record<string, boolean>>({});
  const [activeStepTimers, setActiveStepTimers] = useState<Record<string, number>>({});
  const [runningTimers, setRunningTimers] = useState<Record<string, boolean>>({});
  const [showSeoJsonLd, setShowSeoJsonLd] = useState(false);
  const [hasLiked, setHasLiked] = useState(false);

  const category = categories.find((c) => c.id === recipe.categoryId);
  const diff = getDifficultyLabel(recipe.difficulty);
  const servingRatio = servings / (recipe.servings || 4);

  const isOwner = currentUser.id === recipe.authorId;
  const isAdmin = currentUser.roles.includes('Admin');
  const canManage = isOwner || isAdmin;

  // Toggle ingredient checklist
  const toggleIngredient = (id: string) => {
    setCheckedIngredients((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Step countdown timer effect
  React.useEffect(() => {
    const intervals: NodeJS.Timeout[] = [];
    Object.keys(runningTimers).forEach((stepId) => {
      if (runningTimers[stepId]) {
        const interval = setInterval(() => {
          setActiveStepTimers((prev) => {
            const currentSeconds = prev[stepId] ?? (recipe.steps.find((s) => s.id === stepId)?.timerMinutes || 0) * 60;
            if (currentSeconds <= 1) {
              soundEffects.playTimerBell();
              setRunningTimers((r) => ({ ...r, [stepId]: false }));
              return { ...prev, [stepId]: 0 };
            }
            return { ...prev, [stepId]: currentSeconds - 1 };
          });
        }, 1000);
        intervals.push(interval);
      }
    });

    return () => {
      intervals.forEach((i) => clearInterval(i));
    };
  }, [runningTimers, recipe.steps]);

  const toggleStepTimer = (stepId: string, totalMinutes: number) => {
    if (activeStepTimers[stepId] === undefined) {
      setActiveStepTimers((prev) => ({ ...prev, [stepId]: totalMinutes * 60 }));
    }
    setRunningTimers((prev) => ({ ...prev, [stepId]: !prev[stepId] }));
  };

  const resetStepTimer = (stepId: string, totalMinutes: number) => {
    setRunningTimers((prev) => ({ ...prev, [stepId]: false }));
    setActiveStepTimers((prev) => ({ ...prev, [stepId]: totalMinutes * 60 }));
  };

  const formatTimerDisplay = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Structured Data JSON-LD according to SRS NFR-SEO-001
  const jsonLdData = {
    '@context': 'https://schema.org',
    '@type': 'Recipe',
    name: recipe.title,
    image: recipe.images.map((img) => img.originalUrl),
    author: {
      '@type': 'Person',
      name: recipe.authorName,
    },
    datePublished: recipe.publishedAt || recipe.createdAt,
    description: recipe.description,
    prepTime: `PT${recipe.prepTime}M`,
    cookTime: `PT${recipe.cookTime}M`,
    totalTime: `PT${recipe.prepTime + recipe.cookTime}M`,
    recipeYield: `${servings} portions`,
    recipeCategory: category?.name,
    nutrition: {
      '@type': 'NutritionInformation',
      calories: `${recipe.nutrition.calories} calories`,
      proteinContent: `${recipe.nutrition.protein} grams`,
      carbohydrateContent: `${recipe.nutrition.carbohydrates} grams`,
      fatContent: `${recipe.nutrition.fat} grams`,
    },
    recipeIngredient: recipe.ingredients.map(
      (ing) => `${ing.quantity ? Math.round(ing.quantity * servingRatio * 10) / 10 : ''} ${ing.unit || ''} ${ing.name}`
    ),
    recipeInstructions: recipe.steps.map((st) => ({
      '@type': 'HowToStep',
      name: st.title,
      text: st.description,
    })),
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div className="relative bg-[#FFFFFF] w-full max-w-4xl rounded-3xl shadow-2xl border border-[#DFCEBF] overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Sticky top action bar */}
        <div className="sticky top-0 z-30 bg-[#FFFFFF]/90 backdrop-blur-md px-6 py-4 border-b border-[#E8DFD8] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-[#8C7A6B]">
              {category?.name || 'Recipe'}
            </span>
            <span aria-hidden="true" className="text-[#D5C7BA]">/</span>
            <span className="text-xs font-bold text-[#2D241E] truncate max-w-xs sm:max-w-md">
              {recipe.title}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Instant Push Notification Trigger for this recipe */}
            {canManage && (
              <button
                onClick={() => onOpenBroadcastForRecipe(recipe.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-[#C46836] hover:bg-[#A85427] rounded-xl transition-all shadow-xs cursor-pointer"
                title="Send instant push notification to subscribers about this recipe"
              >
                <Send className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Push Alert</span>
              </button>
            )}

            {/* Cook Focus Mode */}
            <button
              onClick={() => onStartCookingMode(recipe)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-[#43362E] hover:bg-[#2D241E] rounded-xl transition-all shadow-xs cursor-pointer"
            >
              <ChefHat className="w-3.5 h-3.5 text-[#C46836]" />
              <span className="hidden sm:inline">Kitchen Mode</span>
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-[#A6978A] hover:text-[#2D241E] hover:bg-[#F2ECE4] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Recipe Body */}
        <div className="max-h-[82vh] overflow-y-auto p-6 sm:p-8 space-y-8">
          
          {/* Hero Media + Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Gallery (Left: 7 cols) */}
            <div className="lg:col-span-7 space-y-3">
              <div className="relative aspect-4/3 w-full rounded-2xl overflow-hidden bg-[#F2ECE4] ring-1 ring-[#E8DFD8]">
                <img
                  src={recipe.images[activeImageIndex]?.originalUrl || recipe.images[0]?.originalUrl}
                  alt={recipe.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3">
                  <span className={`text-[11px] font-bold px-3 py-1 rounded-lg backdrop-blur-md shadow-xs ${diff.color}`}>
                    Difficulty: {diff.label}
                  </span>
                </div>
              </div>

              {/* Thumbnails if multiple */}
              {recipe.images.length > 1 && (
                <div className="flex gap-2.5 overflow-x-auto pb-1">
                  {recipe.images.map((img, idx) => (
                    <button
                      key={img.id}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`relative w-18 h-18 rounded-xl overflow-hidden shrink-0 transition-all cursor-pointer ${
                        activeImageIndex === idx ? 'ring-2 ring-[#C46836]' : 'opacity-70 hover:opacity-100 ring-1 ring-[#E8DFD8]'
                      }`}
                    >
                      <img src={img.originalUrl} alt={img.altText || ''} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Recipe Header Meta (Right: 5 cols) */}
            <div className="lg:col-span-5 flex flex-col justify-between space-y-5">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#C46836]">
                  <span>{category?.name}</span>
                  <span aria-hidden="true">·</span>
                  <span>{formatDateVN(recipe.publishedAt || recipe.createdAt)}</span>
                </div>

                <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#2D241E] mt-2 leading-tight">
                  {recipe.title}
                </h1>

                <p className="text-xs sm:text-sm text-[#5E5046] mt-3 leading-relaxed">
                  {recipe.description}
                </p>
              </div>

              {/* Key Cooking Metrics Bar */}
              <div className="grid grid-cols-3 gap-2 p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#E8DFD8] text-center">
                <div>
                  <div className="text-[11px] font-medium text-[#8C7A6B]">Prep Time</div>
                  <div className="text-sm font-bold text-[#2D241E] tabular-nums mt-0.5">
                    {formatMinutes(recipe.prepTime)}
                  </div>
                </div>
                <div className="border-x border-[#E8DFD8]">
                  <div className="text-[11px] font-medium text-[#8C7A6B]">Cooking</div>
                  <div className="text-sm font-bold text-[#2D241E] tabular-nums mt-0.5">
                    {formatMinutes(recipe.cookTime)}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] font-medium text-[#8C7A6B]">Servings</div>
                  <div className="text-sm font-bold text-[#2D241E] tabular-nums mt-0.5">
                    {servings} portions
                  </div>
                </div>
              </div>

              {/* Author Info */}
              <div className="p-3.5 rounded-2xl bg-[#F7F3EE] border border-[#E8DFD8] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={recipe.authorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80'}
                    alt={recipe.authorName}
                    className="w-10 h-10 rounded-full object-cover ring-1 ring-[#D5C7BA]"
                  />
                  <div>
                    <div className="text-xs font-bold text-[#2D241E] flex items-center gap-1.5">
                      <span>{recipe.authorName}</span>
                      <ShieldCheck className="w-3.5 h-3.5 text-[#C46836]" />
                    </div>
                    <div className="text-[11px] text-[#8C7A6B]">
                      {recipe.authorRole || 'Culinary Author'}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setHasLiked(!hasLiked)}
                  className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                    hasLiked ? 'bg-rose-50 border-rose-200 text-rose-600' : 'bg-white border-[#E8DFD8] text-[#8C7A6B] hover:text-[#2D241E]'
                  }`}
                  aria-label="Save recipe"
                >
                  <Heart className={`w-4 h-4 ${hasLiked ? 'fill-current' : ''}`} />
                </button>
              </div>

              {/* Author / Admin Action Bar */}
              {canManage && (
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#F2ECE4]">
                  {onEditRecipe && (
                    <button
                      onClick={() => onEditRecipe(recipe)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#FAF7F2] border border-[#D5C7BA] text-[#43362E] hover:bg-[#F2ECE4] cursor-pointer"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                  )}
                  {onTogglePublish && (
                    <button
                      onClick={() => onTogglePublish(recipe)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#FAF7F2] border border-[#D5C7BA] text-[#43362E] hover:bg-[#F2ECE4] cursor-pointer"
                    >
                      <span>{recipe.status === 1 ? 'Unpublish to Draft' : 'Publish to Public'}</span>
                    </button>
                  )}
                  {onArchiveRecipe && (
                    <button
                      onClick={() => onArchiveRecipe(recipe)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#FAF7F2] border border-[#D5C7BA] text-[#43362E] hover:bg-[#F2ECE4] cursor-pointer"
                    >
                      <Archive className="w-3.5 h-3.5" />
                      <span>Archive</span>
                    </button>
                  )}
                </div>
              )}

            </div>

          </div>

          {/* Section: Ingredients with interactive Portion Scaler */}
          <div className="space-y-4 pt-4 border-t border-[#E8DFD8]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-serif text-xl font-bold text-[#2D241E]">
                  Ingredients Checklist
                </h3>
                <p className="text-xs text-[#7C6E65]">
                  Check off prepped items to streamline your kitchen mise en place
                </p>
              </div>

              {/* Portion adjustment stepper */}
              <div className="flex items-center gap-2 bg-[#FAF7F2] p-1.5 rounded-xl border border-[#D5C7BA]">
                <span className="text-xs font-medium text-[#5E5046] px-2">Servings:</span>
                <button
                  onClick={() => setServings(Math.max(1, servings - 1))}
                  className="w-7 h-7 rounded-lg bg-white border border-[#D5C7BA] text-[#2D241E] font-bold text-xs flex items-center justify-center hover:bg-[#F2ECE4] cursor-pointer"
                >
                  -
                </button>
                <span className="font-bold text-xs text-[#2D241E] tabular-nums px-2">
                  {servings}
                </span>
                <button
                  onClick={() => setServings(servings + 1)}
                  className="w-7 h-7 rounded-lg bg-white border border-[#D5C7BA] text-[#2D241E] font-bold text-xs flex items-center justify-center hover:bg-[#F2ECE4] cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>

            {/* Ingredients Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {recipe.ingredients.map((ing) => {
                const isChecked = !!checkedIngredients[ing.id];
                const calculatedQty = ing.quantity
                  ? Math.round(ing.quantity * servingRatio * 10) / 10
                  : null;

                return (
                  <div
                    key={ing.id}
                    onClick={() => toggleIngredient(ing.id)}
                    className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                      isChecked
                        ? 'bg-[#FAF7F2] border-[#E8DFD8] opacity-60'
                        : 'bg-white border-[#E8DFD8] hover:border-[#D5C7BA] shadow-2xs'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-md border mt-0.5 flex items-center justify-center transition-colors shrink-0 ${
                        isChecked
                          ? 'bg-[#43362E] border-[#43362E] text-white'
                          : 'border-[#D5C7BA] bg-[#FAF7F2]'
                      }`}
                    >
                      {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-[#2D241E] flex items-center justify-between">
                        <span className={isChecked ? 'line-through text-[#8C7A6B]' : ''}>
                          {ing.name}
                        </span>
                        {calculatedQty !== null && (
                          <span className="font-bold text-[#C46836] tabular-nums whitespace-nowrap ml-2">
                            {calculatedQty} {ing.unit}
                          </span>
                        )}
                      </div>
                      {ing.notes && (
                        <div className="text-[11px] text-[#8C7A6B] mt-0.5">
                          {ing.notes}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section: Nutrition Breakdown Panel (SRS Owned Entity) */}
          <div className="p-5 rounded-2xl bg-[#FAF7F2] border border-[#E8DFD8]">
            <div className="flex items-center gap-2 mb-3">
              <Flame className="w-4 h-4 text-[#C46836]" />
              <h4 className="font-serif text-base font-bold text-[#2D241E]">
                Nutritional Facts (Per Serving)
              </h4>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 text-center">
              <div className="p-2.5 rounded-xl bg-white border border-[#E8DFD8]">
                <div className="text-[11px] text-[#8C7A6B]">Energy</div>
                <div className="text-sm font-bold text-[#2D241E] tabular-nums mt-0.5">
                  {recipe.nutrition.calories} <span className="text-[10px] font-normal text-[#8C7A6B]">kcal</span>
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-[#E8DFD8]">
                <div className="text-[11px] text-[#8C7A6B]">Protein</div>
                <div className="text-sm font-bold text-[#2D241E] tabular-nums mt-0.5">
                  {recipe.nutrition.protein} <span className="text-[10px] font-normal text-[#8C7A6B]">g</span>
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-[#E8DFD8]">
                <div className="text-[11px] text-[#8C7A6B]">Carbs</div>
                <div className="text-sm font-bold text-[#2D241E] tabular-nums mt-0.5">
                  {recipe.nutrition.carbohydrates} <span className="text-[10px] font-normal text-[#8C7A6B]">g</span>
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-[#E8DFD8]">
                <div className="text-[11px] text-[#8C7A6B]">Total Fat</div>
                <div className="text-sm font-bold text-[#2D241E] tabular-nums mt-0.5">
                  {recipe.nutrition.fat} <span className="text-[10px] font-normal text-[#8C7A6B]">g</span>
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-[#E8DFD8]">
                <div className="text-[11px] text-[#8C7A6B]">Dietary Fiber</div>
                <div className="text-sm font-bold text-[#2D241E] tabular-nums mt-0.5">
                  {recipe.nutrition.fiber ?? 0} <span className="text-[10px] font-normal text-[#8C7A6B]">g</span>
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-[#E8DFD8]">
                <div className="text-[11px] text-[#8C7A6B]">Sodium</div>
                <div className="text-sm font-bold text-[#2D241E] tabular-nums mt-0.5">
                  {recipe.nutrition.sodium ?? 0} <span className="text-[10px] font-normal text-[#8C7A6B]">mg</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section: Detailed Recipe Steps with Step Timers */}
          <div className="space-y-4 pt-4 border-t border-[#E8DFD8]">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif text-xl font-bold text-[#2D241E]">
                  Step-by-Step Instructions
                </h3>
                <p className="text-xs text-[#7C6E65]">
                  Equipped with live countdown timers for precision cooking
                </p>
              </div>

              <button
                onClick={() => onStartCookingMode(recipe)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-[#F0E6DD] text-[#63391A] hover:bg-[#E8D9CD] transition-colors cursor-pointer"
              >
                <BookOpen className="w-3.5 h-3.5 text-[#C46836]" />
                <span>Fullscreen Kitchen Mode</span>
              </button>
            </div>

            <div className="space-y-4">
              {recipe.steps.map((step) => {
                const totalSeconds = (step.timerMinutes || 0) * 60;
                const remainingSeconds = activeStepTimers[step.id] ?? totalSeconds;
                const isRunning = !!runningTimers[step.id];

                return (
                  <div
                    key={step.id}
                    className="p-5 rounded-2xl bg-white border border-[#E8DFD8] shadow-2xs space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <span className="w-7 h-7 rounded-xl bg-[#43362E] text-white text-xs font-bold flex items-center justify-center shrink-0">
                          {step.stepNumber}
                        </span>
                        <h4 className="text-sm font-bold text-[#2D241E]">
                          {step.title}
                        </h4>
                      </div>

                      {/* Step Timer if duration exists */}
                      {step.timerMinutes && step.timerMinutes > 0 && (
                        <div className="flex items-center gap-1.5 bg-[#FAF7F2] px-2.5 py-1 rounded-xl border border-[#D5C7BA] text-xs">
                          <span className={`font-mono font-bold tabular-nums ${isRunning ? 'text-[#C46836]' : 'text-[#43362E]'}`}>
                            {formatTimerDisplay(remainingSeconds)}
                          </span>
                          <button
                            onClick={() => toggleStepTimer(step.id, step.timerMinutes!)}
                            className="p-1 rounded-lg hover:bg-[#F2ECE4] text-[#43362E] transition-colors cursor-pointer"
                            title={isRunning ? 'Pause Timer' : 'Start Timer'}
                          >
                            {isRunning ? <Pause className="w-3 h-3 text-[#C46836]" /> : <Play className="w-3 h-3" />}
                          </button>
                          <button
                            onClick={() => resetStepTimer(step.id, step.timerMinutes!)}
                            className="p-1 rounded-lg hover:bg-[#F2ECE4] text-[#8C7A6B] transition-colors cursor-pointer"
                            title="Reset Timer"
                          >
                            <RotateCcw className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>

                    <p className="text-xs sm:text-sm text-[#5E5046] leading-relaxed pl-9">
                      {step.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SEO Structured Data Schema Preview (SRS NFR-SEO-001) */}
          <div className="pt-4 border-t border-[#E8DFD8]">
            <button
              onClick={() => setShowSeoJsonLd(!showSeoJsonLd)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#8C7A6B] hover:text-[#2D241E] transition-colors cursor-pointer"
            >
              <Code className="w-3.5 h-3.5" />
              <span>{showSeoJsonLd ? 'Hide Schema.org Recipe JSON-LD' : 'Inspect Schema.org Recipe JSON-LD (Google Rich Snippets SEO)'}</span>
            </button>

            {showSeoJsonLd && (
              <pre className="mt-3 p-4 rounded-xl bg-[#2D241E] text-[#F5EFEB] text-[11px] font-mono overflow-x-auto leading-relaxed">
                {JSON.stringify(jsonLdData, null, 2)}
              </pre>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
