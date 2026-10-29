import React, { useState, useEffect, useMemo } from 'react';
import { Recipe, Category, ApplicationUser, PushNotification, Subscriber } from './types';
import { 
  INITIAL_RECIPES, 
  INITIAL_CATEGORIES, 
  INITIAL_USERS, 
  INITIAL_NOTIFICATIONS, 
  INITIAL_SUBSCRIBERS 
} from './data/mockData';
import { removeVietnameseAccents } from './utils/textUtils';
import { pushNotificationService } from './services/pushNotificationService';
import { soundEffects } from './services/soundEffects';

// Components
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { RecipeCard } from './components/RecipeCard';
import { RecipeDetailModal } from './components/RecipeDetailModal';
import { CookingFocusMode } from './components/CookingFocusMode';
import { RecipeEditorModal } from './components/RecipeEditorModal';
import { PushBroadcastModal } from './components/PushBroadcastModal';
import { PushNotificationDrawer } from './components/PushNotificationDrawer';
import { LivePushToast } from './components/LivePushToast';
import { PushManagementView } from './components/PushManagementView';
import { CategoriesView } from './components/CategoriesView';
import { MyRecipesView } from './components/MyRecipesView';
import { Footer } from './components/Footer';

// Icons
import { ChefHat, Send } from 'lucide-react';
import confetti from 'canvas-confetti';

const STORAGE_KEY_RECIPES = 'culinary_blog_recipes_store_en_v4';
const STORAGE_KEY_CATEGORIES = 'culinary_blog_categories_store_en_v4';

const VIETNAMESE_CHAR_REGEX = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđĐ]/i;

// Clean legacy cache immediately upon load
if (typeof window !== 'undefined') {
  try {
    const legacyKeys = [
      'culinary_blog_recipes_store',
      'culinary_blog_recipes_store_v1',
      'culinary_blog_recipes_store_v2',
      'culinary_blog_categories_store',
      'culinary_blog_categories_store_v1',
      'culinary_blog_categories_store_v2',
      'culinary_blog_notifications_v1',
      'culinary_blog_notifications_v2',
      'culinary_blog_subscribers_v1',
      'culinary_blog_subscribers_v2',
    ];
    legacyKeys.forEach((key) => localStorage.removeItem(key));
  } catch {
    // ignore
  }
}

export default function App() {
  // 1. Data States with LocalStorage Persistence & Language Validation
  const [recipes, setRecipes] = useState<Recipe[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(STORAGE_KEY_RECIPES);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            // Check if any recipe is still in Vietnamese
            const hasVietnamese = parsed.some((r: Recipe) => 
              VIETNAMESE_CHAR_REGEX.test(r.title) || 
              r.title.toLowerCase().includes('phở') ||
              r.title.toLowerCase().includes('cá hồi')
            );
            if (!hasVietnamese) {
              return parsed;
            }
          }
        }
      } catch {
        // fallback
      }
    }
    return INITIAL_RECIPES;
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(STORAGE_KEY_CATEGORIES);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const hasVietnamese = parsed.some((c: Category) => 
              VIETNAMESE_CHAR_REGEX.test(c.name) ||
              c.name.toLowerCase().includes('món') ||
              c.name.toLowerCase().includes('tráng miệng')
            );
            if (!hasVietnamese) {
              return parsed;
            }
          }
        }
      } catch {
        // fallback
      }
    }
    return INITIAL_CATEGORIES;
  });

  const [subscribers] = useState<Subscriber[]>(() => {
    const stored = pushNotificationService.getStoredSubscribers();
    return stored.length > 0 ? stored : INITIAL_SUBSCRIBERS;
  });

  const [notifications, setNotifications] = useState<PushNotification[]>(() => {
    const stored = pushNotificationService.getStoredNotifications();
    return stored.length > 0 ? stored : INITIAL_NOTIFICATIONS;
  });

  // 2. User & Navigation State
  const [currentUser, setCurrentUser] = useState<ApplicationUser>(INITIAL_USERS[0]); // Default: Chef Linh Dan
  const [activeTab, setActiveTab] = useState<'explore' | 'categories' | 'my-recipes' | 'push-center'>('explore');

  // 3. Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [maxCookTime, setMaxCookTime] = useState(999);

  // 4. Modal States
  const [selectedRecipeDetail, setSelectedRecipeDetail] = useState<Recipe | null>(null);
  const [cookingModeRecipe, setCookingModeRecipe] = useState<Recipe | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [recipeToEdit, setRecipeToEdit] = useState<Recipe | null>(null);
  const [isBroadcastOpen, setIsBroadcastOpen] = useState(false);
  const [broadcastTargetRecipeId, setBroadcastTargetRecipeId] = useState<string | undefined>(undefined);
  const [isNotificationDrawerOpen, setIsNotificationDrawerOpen] = useState(false);
  const [isPushGranted, setIsPushGranted] = useState(pushNotificationService.isBrowserPermissionGranted());

  // Save changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_RECIPES, JSON.stringify(recipes));
    } catch {
      // ignore
    }
  }, [recipes]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(categories));
    } catch {
      // ignore
    }
  }, [categories]);

  // Push subscription sync
  useEffect(() => {
    const unsubscribe = pushNotificationService.subscribe((newNotif) => {
      setNotifications((prev) => [newNotif, ...prev]);
    });
    return unsubscribe;
  }, []);

  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.read).length;
  }, [notifications]);

  // Request browser push permissions
  const handleEnablePush = async () => {
    const result = await pushNotificationService.requestBrowserPermission();
    setIsPushGranted(result === 'granted');
    if (result === 'granted') {
      soundEffects.playPushNotificationChime();
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.5 },
          colors: ['#C46836', '#FAF7F2'],
        });
      } catch {
        // ignore
      }
    }
  };

  // Recipe Mutations (SRS FR-RCP-003, 004, 005, 006, 007)
  const handleSaveRecipe = (recipe: Recipe) => {
    setRecipes((prev) => {
      const exists = prev.some((r) => r.id === recipe.id);
      if (exists) {
        return prev.map((r) => (r.id === recipe.id ? recipe : r));
      }
      return [recipe, ...prev];
    });

    if (selectedRecipeDetail?.id === recipe.id) {
      setSelectedRecipeDetail(recipe);
    }
  };

  const handleTogglePublish = (recipe: Recipe) => {
    const newStatus = recipe.status === 1 ? 0 : 1;
    const updated: Recipe = {
      ...recipe,
      status: newStatus,
      publishedAt: newStatus === 1 ? new Date().toISOString() : undefined,
      updatedAt: new Date().toISOString(),
    };
    handleSaveRecipe(updated);

    // If published, trigger automated push notification!
    if (newStatus === 1) {
      pushNotificationService.notifyRecipePublished(updated, currentUser.displayName);
      try {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#C46836', '#43362E', '#D97706'],
        });
      } catch {
        // ignore
      }
    }
  };

  const handleArchiveRecipe = (recipe: Recipe) => {
    const updated: Recipe = {
      ...recipe,
      status: 2, // Archived
      updatedAt: new Date().toISOString(),
    };
    handleSaveRecipe(updated);
  };

  const handleDeleteRecipe = (recipeId: string) => {
    setRecipes((prev) => prev.filter((r) => r.id !== recipeId));
    if (selectedRecipeDetail?.id === recipeId) {
      setSelectedRecipeDetail(null);
    }
  };

  // Category Mutation (FR-CAT-003)
  const handleAddCategory = (newCat: Omit<Category, 'id' | 'recipeCount'>) => {
    const cat: Category = {
      ...newCat,
      id: 'cat_' + Date.now(),
      recipeCount: 0,
    };
    setCategories((prev) => [...prev, cat]);
  };

  // Mark all notifications read
  const handleMarkAllRead = () => {
    const updated = notifications.map((n) => ({ ...n, read: true }));
    setNotifications(updated);
    pushNotificationService.saveNotifications(updated);
  };

  // Quick test push dispatch
  const handleQuickDispatchTest = () => {
    const sampleRecipe = recipes.find((r) => r.status === 1) || recipes[0];
    pushNotificationService.dispatchPush({
      title: `🔥 Instant Recipe Push Alert: ${sampleRecipe.title}`,
      message: `Push engine active! Readers just received an instant alert for "${sampleRecipe.title}" in < 80ms.`,
      recipeId: sampleRecipe.id,
      recipeSlug: sampleRecipe.slug,
      recipeTitle: sampleRecipe.title,
      recipeImage: sampleRecipe.images[0]?.originalUrl,
      authorName: currentUser.displayName,
      priority: 'urgent',
      segment: 'All Subscribers',
      reachCount: 1480,
    });
    try {
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#C46836', '#43362E', '#D97706'],
      });
    } catch {
      // ignore
    }
  };

  // Filtered recipes for Explore view
  const filteredRecipes = useMemo(() => {
    return recipes.filter((r) => {
      // Status filter: Guest only sees Published (1). Author/Admin sees their own Drafts too
      if (currentUser.roles.includes('Guest') && r.status !== 1) {
        return false;
      }

      // Search text filter
      if (searchQuery.trim()) {
        const queryNorm = removeVietnameseAccents(searchQuery.toLowerCase());
        const titleNorm = removeVietnameseAccents(r.title.toLowerCase());
        const descNorm = removeVietnameseAccents(r.description.toLowerCase());
        const ingNorm = removeVietnameseAccents(r.ingredients.map((i) => i.name).join(' ').toLowerCase());
        if (!titleNorm.includes(queryNorm) && !descNorm.includes(queryNorm) && !ingNorm.includes(queryNorm)) {
          return false;
        }
      }

      // Category filter
      if (selectedCategoryId !== 'all' && r.categoryId !== selectedCategoryId) {
        return false;
      }

      // Difficulty filter
      if (selectedDifficulty !== 'all' && r.difficulty !== Number(selectedDifficulty)) {
        return false;
      }

      // Cook time filter
      if (maxCookTime < 999 && (r.prepTime + r.cookTime) > maxCookTime) {
        return false;
      }

      return true;
    });
  }, [recipes, currentUser, searchQuery, selectedCategoryId, selectedDifficulty, maxCookTime]);

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#2D241E] flex flex-col font-sans selection:bg-[#E8DFD8]">
      
      {/* 1. Header with Top Bar Contract & Role Switcher */}
      <Header
        currentUser={currentUser}
        onSwitchUser={setCurrentUser}
        availableUsers={INITIAL_USERS}
        unreadCount={unreadCount}
        onOpenNotifications={() => setIsNotificationDrawerOpen(true)}
        onOpenBroadcast={() => {
          setBroadcastTargetRecipeId(undefined);
          setIsBroadcastOpen(true);
        }}
        onOpenNewRecipe={() => {
          setRecipeToEdit(null);
          setIsEditorOpen(true);
        }}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* 2. Main Content Canvas */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* VIEW 1: EXPLORE & RECIPE CATALOG */}
        {activeTab === 'explore' && (
          <div className="space-y-10">
            {/* Editorial Hero Section */}
            <HeroSection
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              categories={categories}
              selectedCategoryId={selectedCategoryId}
              onSelectCategory={setSelectedCategoryId}
              selectedDifficulty={selectedDifficulty}
              onSelectDifficulty={setSelectedDifficulty}
              maxTime={maxCookTime}
              onSelectMaxTime={setMaxCookTime}
              onOpenBroadcast={() => {
                setBroadcastTargetRecipeId(undefined);
                setIsBroadcastOpen(true);
              }}
              onEnablePush={handleEnablePush}
              isPushGranted={isPushGranted}
            />

            {/* Recipes Section */}
            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#2D241E]">
                    Curated Culinary Recipes
                  </h2>
                  <p className="text-xs text-[#7C6E65] mt-1">
                    Showing <span className="font-bold text-[#2D241E] tabular-nums">{filteredRecipes.length}</span> signature dishes
                  </p>
                </div>

                {/* Instant broadcast quick trigger */}
                <button
                  onClick={() => {
                    setBroadcastTargetRecipeId(undefined);
                    setIsBroadcastOpen(true);
                  }}
                  className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-[#F0E6DD] text-[#63391A] hover:bg-[#E8D9CD] transition-all border border-[#DFCEBF] cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5 text-[#C46836]" />
                  <span>Broadcast to Readers</span>
                </button>
              </div>

              {filteredRecipes.length === 0 ? (
                <div className="py-20 text-center bg-white rounded-3xl border border-[#E8DFD8] space-y-3 p-8">
                  <ChefHat className="w-12 h-12 text-[#D5C7BA] mx-auto" />
                  <h3 className="font-serif text-lg font-bold text-[#2D241E]">
                    No recipes found matching your filters
                  </h3>
                  <p className="text-xs text-[#7C6E65] max-w-md mx-auto">
                    Try adjusting your search query or reset the preparation time and difficulty filters.
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategoryId('all');
                      setSelectedDifficulty('all');
                      setMaxCookTime(999);
                    }}
                    className="px-4 py-2 text-xs font-bold text-white bg-[#43362E] rounded-xl hover:bg-[#2D241E] cursor-pointer"
                  >
                    Reset All Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                  {filteredRecipes.map((recipe) => (
                    <RecipeCard
                      key={recipe.id}
                      recipe={recipe}
                      categories={categories}
                      onSelect={(r) => setSelectedRecipeDetail(r)}
                      onCookNow={(r) => setCookingModeRecipe(r)}
                      isOwnerOrAdmin={currentUser.roles.includes('Admin') || currentUser.id === recipe.authorId}
                    />
                  ))}
                </div>
              )}
            </section>
          </div>
        )}

        {/* VIEW 2: CATEGORIES VIEW */}
        {activeTab === 'categories' && (
          <CategoriesView
            categories={categories}
            recipes={recipes}
            onSelectRecipe={(r) => setSelectedRecipeDetail(r)}
            currentUser={currentUser}
            onAddCategory={handleAddCategory}
          />
        )}

        {/* VIEW 3: MY RECIPES VIEW (AUTHOR / ADMIN) */}
        {activeTab === 'my-recipes' && (
          <MyRecipesView
            recipes={recipes}
            categories={categories}
            currentUser={currentUser}
            onSelectRecipe={(r) => setSelectedRecipeDetail(r)}
            onOpenNewRecipe={() => {
              setRecipeToEdit(null);
              setIsEditorOpen(true);
            }}
            onEditRecipe={(r) => {
              setRecipeToEdit(r);
              setIsEditorOpen(true);
            }}
            onTogglePublish={handleTogglePublish}
            onArchiveRecipe={handleArchiveRecipe}
            onDeleteRecipe={handleDeleteRecipe}
            onOpenBroadcastForRecipe={(recipeId) => {
              setBroadcastTargetRecipeId(recipeId);
              setIsBroadcastOpen(true);
            }}
          />
        )}

        {/* VIEW 4: PUSH NOTIFICATION MANAGEMENT CENTER */}
        {activeTab === 'push-center' && (
          <PushManagementView
            notifications={notifications}
            subscribers={subscribers}
            recipes={recipes}
            currentUser={currentUser}
            onOpenBroadcast={() => {
              setBroadcastTargetRecipeId(undefined);
              setIsBroadcastOpen(true);
            }}
            onSelectRecipe={(id) => {
              const r = recipes.find((x) => x.id === id);
              if (r) setSelectedRecipeDetail(r);
            }}
            onQuickDispatchTest={handleQuickDispatchTest}
          />
        )}

      </main>

      {/* 3. Footer */}
      <Footer
        onOpenBroadcast={() => {
          setBroadcastTargetRecipeId(undefined);
          setIsBroadcastOpen(true);
        }}
        onOpenNotifications={() => setIsNotificationDrawerOpen(true)}
      />

      {/* 4. Real-Time Floating Live Push Toast (Interactive slide-down on screen) */}
      <LivePushToast
        onSelectRecipe={(id) => {
          const r = recipes.find((x) => x.id === id);
          if (r) setSelectedRecipeDetail(r);
        }}
      />

      {/* 5. Modals & Drawers */}
      
      {/* Recipe Detail Modal */}
      <RecipeDetailModal
        recipe={selectedRecipeDetail}
        onClose={() => setSelectedRecipeDetail(null)}
        categories={categories}
        currentUser={currentUser}
        onStartCookingMode={(r) => {
          setSelectedRecipeDetail(null);
          setCookingModeRecipe(r);
        }}
        onOpenBroadcastForRecipe={(id) => {
          setBroadcastTargetRecipeId(id);
          setIsBroadcastOpen(true);
        }}
        onEditRecipe={(r) => {
          setSelectedRecipeDetail(null);
          setRecipeToEdit(r);
          setIsEditorOpen(true);
        }}
        onTogglePublish={handleTogglePublish}
        onArchiveRecipe={handleArchiveRecipe}
        onDeleteRecipe={handleDeleteRecipe}
      />

      {/* Kitchen Cooking Focus Mode */}
      {cookingModeRecipe && (
        <CookingFocusMode
          recipe={cookingModeRecipe}
          onClose={() => setCookingModeRecipe(null)}
        />
      )}

      {/* Recipe Create & Edit Wizard */}
      <RecipeEditorModal
        isOpen={isEditorOpen}
        onClose={() => {
          setIsEditorOpen(false);
          setRecipeToEdit(null);
        }}
        categories={categories}
        currentUser={currentUser}
        onSaveRecipe={handleSaveRecipe}
        recipeToEdit={recipeToEdit}
      />

      {/* Instant Push Broadcast Modal */}
      <PushBroadcastModal
        isOpen={isBroadcastOpen}
        onClose={() => setIsBroadcastOpen(false)}
        recipes={recipes}
        preSelectedRecipeId={broadcastTargetRecipeId}
        currentUser={currentUser}
        onNotificationSent={() => {
          setNotifications(pushNotificationService.getStoredNotifications());
        }}
      />

      {/* Notification Center Slide-over Drawer */}
      <PushNotificationDrawer
        isOpen={isNotificationDrawerOpen}
        onClose={() => setIsNotificationDrawerOpen(false)}
        notifications={notifications}
        onSelectRecipe={(id) => {
          const r = recipes.find((x) => x.id === id);
          if (r) setSelectedRecipeDetail(r);
        }}
        onOpenBroadcast={() => {
          setIsNotificationDrawerOpen(false);
          setBroadcastTargetRecipeId(undefined);
          setIsBroadcastOpen(true);
        }}
        onMarkAllRead={handleMarkAllRead}
        currentUser={currentUser}
      />

    </div>
  );
}
