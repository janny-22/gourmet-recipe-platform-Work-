import React, { useState } from 'react';
import { Recipe, Category, ApplicationUser, RecipeIngredient, RecipeStep, DifficultyLevel, RecipeStatus } from '../types';
import { generateSlug } from '../utils/textUtils';
import { pushNotificationService } from '../services/pushNotificationService';
import { 
  X, 
  Plus, 
  Trash2, 
  ChefHat, 
  Send, 
  Radio, 
  Sparkles, 
  Check, 
  Clock, 
  Users,
  Image as ImageIcon
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface RecipeEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  currentUser: ApplicationUser;
  onSaveRecipe: (recipe: Recipe) => void;
  recipeToEdit?: Recipe | null;
}

export const RecipeEditorModal: React.FC<RecipeEditorModalProps> = ({
  isOpen,
  onClose,
  categories,
  currentUser,
  onSaveRecipe,
  recipeToEdit,
}) => {
  if (!isOpen) return null;

  const isEditing = !!recipeToEdit;

  const [title, setTitle] = useState(recipeToEdit?.title || '');
  const [description, setDescription] = useState(recipeToEdit?.description || '');
  const [categoryId, setCategoryId] = useState(recipeToEdit?.categoryId || categories[0]?.id || '');
  const [prepTime, setPrepTime] = useState(recipeToEdit?.prepTime || 20);
  const [cookTime, setCookTime] = useState(recipeToEdit?.cookTime || 30);
  const [servings, setServings] = useState(recipeToEdit?.servings || 4);
  const [difficulty, setDifficulty] = useState<DifficultyLevel>(recipeToEdit?.difficulty || 2);
  const [status, setStatus] = useState<RecipeStatus>(recipeToEdit?.status || 1); // Default to Published
  const [autoBroadcast, setAutoBroadcast] = useState(true);
  const [imageUrl, setImageUrl] = useState(
    recipeToEdit?.images[0]?.originalUrl || '/src/assets/images/recipe_pho_bo_vietnam_1792467760008.jpg'
  );

  // Nutrition
  const [calories, setCalories] = useState(recipeToEdit?.nutrition?.calories || 450);
  const [protein, setProtein] = useState(recipeToEdit?.nutrition?.protein || 30);
  const [carbs, setCarbs] = useState(recipeToEdit?.nutrition?.carbohydrates || 45);
  const [fat, setFat] = useState(recipeToEdit?.nutrition?.fat || 15);

  // Ingredients
  const [ingredients, setIngredients] = useState<RecipeIngredient[]>(
    recipeToEdit?.ingredients || [
      { id: 'ing_init_1', recipeId: '', name: 'Main ingredient (protein / fresh mushrooms)', quantity: 400, unit: 'grams', notes: 'prepped', orderIndex: 1 },
      { id: 'ing_init_2', recipeId: '', name: 'Aromatic herbs & spices (shallot, garlic, pepper)', quantity: 2, unit: 'tbsp', notes: 'minced', orderIndex: 2 },
    ]
  );

  // Steps
  const [steps, setSteps] = useState<RecipeStep[]>(
    recipeToEdit?.steps || [
      { id: 'step_init_1', recipeId: '', stepNumber: 1, title: 'Prep & Marinate', description: 'Cleanse and slice the ingredients. Toss with seasonings and let rest for 15 minutes to absorb aromatics.', timerMinutes: 15 },
      { id: 'step_init_2', recipeId: '', stepNumber: 2, title: 'Sear & Simmer', description: 'Heat skillet or pot with oil, sauté aromatics until fragrant, then cook over medium heat until tender.', timerMinutes: 20 },
      { id: 'step_init_3', recipeId: '', stepNumber: 3, title: 'Plate & Garnish', description: 'Transfer to warm ceramic dinnerware, garnish with fresh herbs, and serve hot.', timerMinutes: 3 },
    ]
  );

  // Active form tab
  const [activeTab, setActiveTab] = useState<'basic' | 'ingredients' | 'steps' | 'nutrition'>('basic');

  const handleAddIngredient = () => {
    const newIng: RecipeIngredient = {
      id: 'ing_' + Date.now(),
      recipeId: recipeToEdit?.id || '',
      name: '',
      quantity: 100,
      unit: 'grams',
      notes: '',
      orderIndex: ingredients.length + 1,
    };
    setIngredients([...ingredients, newIng]);
  };

  const handleRemoveIngredient = (id: string) => {
    setIngredients(ingredients.filter((i) => i.id !== id));
  };

  const handleUpdateIngredient = (id: string, field: keyof RecipeIngredient, value: unknown) => {
    setIngredients(
      ingredients.map((ing) => (ing.id === id ? { ...ing, [field]: value } : ing))
    );
  };

  const handleAddStep = () => {
    const newStep: RecipeStep = {
      id: 'step_' + Date.now(),
      recipeId: recipeToEdit?.id || '',
      stepNumber: steps.length + 1,
      title: `Step ${steps.length + 1}`,
      description: '',
      timerMinutes: 5,
    };
    setSteps([...steps, newStep]);
  };

  const handleRemoveStep = (id: string) => {
    const filtered = steps.filter((s) => s.id !== id);
    const renumbered = filtered.map((s, idx) => ({ ...s, stepNumber: idx + 1 }));
    setSteps(renumbered);
  };

  const handleUpdateStep = (id: string, field: keyof RecipeStep, value: unknown) => {
    setSteps(
      steps.map((st) => (st.id === id ? { ...st, [field]: value } : st))
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setActiveTab('basic');
      return;
    }

    const recipeId = recipeToEdit?.id || 'rcp_' + Date.now();
    const slug = recipeToEdit?.slug || generateSlug(title);

    const savedRecipe: Recipe = {
      id: recipeId,
      title,
      slug,
      description: description || 'Artisanal home-cooked meal full of natural flavor and aroma.',
      instructions: steps.map((s) => `${s.stepNumber}. ${s.title}: ${s.description}`).join('\n'),
      prepTime: Number(prepTime) || 15,
      cookTime: Number(cookTime) || 20,
      servings: Number(servings) || 4,
      difficulty,
      status,
      categoryId,
      authorId: recipeToEdit?.authorId || currentUser.id,
      authorName: recipeToEdit?.authorName || currentUser.displayName,
      authorAvatar: recipeToEdit?.authorAvatar || currentUser.avatarUrl,
      publishedAt: status === 1 ? new Date().toISOString() : undefined,
      createdAt: recipeToEdit?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      nutrition: {
        calories: Number(calories) || 350,
        protein: Number(protein) || 25,
        carbohydrates: Number(carbs) || 30,
        fat: Number(fat) || 12,
      },
      ingredients: ingredients.map((ing, i) => ({ ...ing, recipeId, orderIndex: i + 1 })),
      steps: steps.map((st, i) => ({ ...st, recipeId, stepNumber: i + 1 })),
      images: [
        {
          id: 'img_' + recipeId,
          recipeId,
          originalUrl: imageUrl,
          isPrimary: true,
          orderIndex: 1,
        },
      ],
      viewsCount: recipeToEdit?.viewsCount || 1,
      likesCount: recipeToEdit?.likesCount || 0,
    };

    onSaveRecipe(savedRecipe);

    // If published and autoBroadcast is enabled, send instant push!
    if (status === 1 && autoBroadcast) {
      pushNotificationService.notifyRecipePublished(savedRecipe, currentUser.displayName);
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#C46836', '#43362E', '#D97706'],
        });
      } catch {
        // ignore
      }
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div className="relative bg-[#FFFFFF] w-full max-w-3xl rounded-3xl shadow-2xl border border-[#DFCEBF] overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-[#FAF7F2] border-b border-[#E8DFD8] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#43362E] text-white flex items-center justify-center">
              <ChefHat className="w-5 h-5 text-[#C46836]" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-[#2D241E]">
                {isEditing ? 'Edit Recipe' : 'Create & Publish New Recipe'}
              </h3>
              <p className="text-xs text-[#7C6E65]">
                SRS Standardized Data Model · Automated instant push alerts to readers
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#A6978A] hover:text-[#2D241E] hover:bg-[#F2ECE4] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigator */}
        <div className="flex border-b border-[#E8DFD8] bg-[#FAF7F2] px-6 gap-2 pt-2 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('basic')}
            className={`pb-3 px-3 transition-colors relative cursor-pointer ${
              activeTab === 'basic' ? 'text-[#C46836] border-b-2 border-[#C46836]' : 'text-[#7C6E65] hover:text-[#2D241E]'
            }`}
          >
            1. Overview
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('ingredients')}
            className={`pb-3 px-3 transition-colors relative cursor-pointer ${
              activeTab === 'ingredients' ? 'text-[#C46836] border-b-2 border-[#C46836]' : 'text-[#7C6E65] hover:text-[#2D241E]'
            }`}
          >
            2. Ingredients ({ingredients.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('steps')}
            className={`pb-3 px-3 transition-colors relative cursor-pointer ${
              activeTab === 'steps' ? 'text-[#C46836] border-b-2 border-[#C46836]' : 'text-[#7C6E65] hover:text-[#2D241E]'
            }`}
          >
            3. Step-by-Step ({steps.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('nutrition')}
            className={`pb-3 px-3 transition-colors relative cursor-pointer ${
              activeTab === 'nutrition' ? 'text-[#C46836] border-b-2 border-[#C46836]' : 'text-[#7C6E65] hover:text-[#2D241E]'
            }`}
          >
            4. Nutrition & Publish
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit}>
          <div className="max-h-[68vh] overflow-y-auto p-6 space-y-6">
            
            {/* TAB 1: BASIC INFO */}
            {activeTab === 'basic' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#5E5046] mb-1">
                    Recipe Title *
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    placeholder="e.g. Classic Beef Pho with Charred Ginger Broth"
                    className="w-full px-4 py-2.5 rounded-xl border border-[#D5C7BA] bg-white text-sm text-[#2D241E] focus:outline-none focus:ring-2 focus:ring-[#C46836]/40 focus:border-[#C46836]"
                  />
                  {title && (
                    <div className="text-[11px] text-[#8C7A6B] mt-1 flex items-center gap-1">
                      <span>Generated Slug:</span>
                      <code className="text-[#C46836] font-mono">/recipes/{generateSlug(title)}</code>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#5E5046] mb-1">
                      Category
                    </label>
                    <select
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5C7BA] bg-[#FAF7F2] text-sm text-[#2D241E] focus:outline-none focus:ring-2 focus:ring-[#C46836]/40 cursor-pointer"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#5E5046] mb-1">
                      Difficulty Level
                    </label>
                    <select
                      value={difficulty}
                      onChange={(e) => setDifficulty(Number(e.target.value) as DifficultyLevel)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5C7BA] bg-[#FAF7F2] text-sm text-[#2D241E] focus:outline-none focus:ring-2 focus:ring-[#C46836]/40 cursor-pointer"
                    >
                      <option value={1}>Easy (Beginner friendly)</option>
                      <option value={2}>Medium (Basic cooking skills)</option>
                      <option value={3}>Hard (Multi-step techniques)</option>
                      <option value={4}>Expert (Michelin restaurant standard)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#5E5046] mb-1">
                      Prep (mins)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={prepTime}
                      onChange={(e) => setPrepTime(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-[#D5C7BA] text-sm tabular-nums"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#5E5046] mb-1">
                      Cook (mins)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={cookTime}
                      onChange={(e) => setCookTime(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-[#D5C7BA] text-sm tabular-nums"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#5E5046] mb-1">
                      Servings
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={servings}
                      onChange={(e) => setServings(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-[#D5C7BA] text-sm tabular-nums"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#5E5046] mb-1">
                    Short Description (Preview & SEO)
                  </label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe flavor profiles, origins, culinary highlights..."
                    className="w-full px-4 py-2.5 rounded-xl border border-[#D5C7BA] text-sm text-[#2D241E] focus:outline-none focus:ring-2 focus:ring-[#C46836]/40"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#5E5046] mb-1">
                    Cover Image URL
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="Image link..."
                      className="flex-1 px-4 py-2 rounded-xl border border-[#D5C7BA] text-xs font-mono"
                    />
                    <select
                      onChange={(e) => setImageUrl(e.target.value)}
                      className="px-3 py-2 rounded-xl border border-[#D5C7BA] bg-[#FAF7F2] text-xs cursor-pointer"
                    >
                      <option value="">Sample Gallery</option>
                      <option value="/src/assets/images/recipe_pho_bo_vietnam_1792467760008.jpg">Hanoi Beef Pho</option>
                      <option value="/src/assets/images/recipe_caramelized_salmon_1792467805121.jpg">Pan-Seared Salmon</option>
                      <option value="/src/assets/images/recipe_matcha_tiramisu_1792467784759.jpg">Kyoto Matcha Tiramisu</option>
                      <option value="/src/assets/images/recipe_goi_cuon_tom_thit_1792469057147.jpg">Summer Spring Rolls</option>
                      <option value="/src/assets/images/recipe_nam_kho_tieu_1792469057895.jpg">Clay-Pot Mushrooms</option>
                      <option value="/src/assets/images/recipe_tra_hoa_cuc_1792469058242.jpg">Chrysanthemum Herbal Tea</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: INGREDIENTS */}
            {activeTab === 'ingredients' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#7C6E65]">
                    Scaled ingredients for {servings} portions
                  </span>
                  <button
                    type="button"
                    onClick={handleAddIngredient}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#FAF7F2] border border-[#D5C7BA] text-[#43362E] hover:bg-[#F2ECE4] cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Ingredient</span>
                  </button>
                </div>

                <div className="space-y-2.5">
                  {ingredients.map((ing, idx) => (
                    <div key={ing.id} className="flex items-center gap-2 bg-[#FAF7F2] p-2.5 rounded-xl border border-[#E8DFD8]">
                      <span className="text-xs font-bold text-[#8C7A6B] w-5 text-center">
                        {idx + 1}
                      </span>
                      <input
                        type="text"
                        placeholder="Ingredient name *"
                        value={ing.name}
                        onChange={(e) => handleUpdateIngredient(ing.id, 'name', e.target.value)}
                        className="flex-1 px-3 py-1.5 rounded-lg border border-[#D5C7BA] bg-white text-xs"
                        required
                      />
                      <input
                        type="number"
                        placeholder="Qty"
                        value={ing.quantity || ''}
                        onChange={(e) => handleUpdateIngredient(ing.id, 'quantity', Number(e.target.value))}
                        className="w-20 px-2.5 py-1.5 rounded-lg border border-[#D5C7BA] bg-white text-xs tabular-nums"
                      />
                      <input
                        type="text"
                        placeholder="Unit"
                        value={ing.unit || ''}
                        onChange={(e) => handleUpdateIngredient(ing.id, 'unit', e.target.value)}
                        className="w-20 px-2.5 py-1.5 rounded-lg border border-[#D5C7BA] bg-white text-xs"
                      />
                      <input
                        type="text"
                        placeholder="Notes (optional)"
                        value={ing.notes || ''}
                        onChange={(e) => handleUpdateIngredient(ing.id, 'notes', e.target.value)}
                        className="w-36 px-2.5 py-1.5 rounded-lg border border-[#D5C7BA] bg-white text-xs hidden sm:block"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveIngredient(ing.id)}
                        className="p-1.5 text-stone-400 hover:text-rose-600 rounded-lg hover:bg-white transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: STEPS */}
            {activeTab === 'steps' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#7C6E65]">
                    Step-by-step techniques with dedicated countdown timer
                  </span>
                  <button
                    type="button"
                    onClick={handleAddStep}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#FAF7F2] border border-[#D5C7BA] text-[#43362E] hover:bg-[#F2ECE4] cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Step</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {steps.map((step) => (
                    <div key={step.id} className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E8DFD8] space-y-3">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-lg bg-[#43362E] text-white text-xs font-bold flex items-center justify-center">
                            {step.stepNumber}
                          </span>
                          <input
                            type="text"
                            placeholder="Step Title (e.g. Prep, Simmer, Season...)"
                            value={step.title}
                            onChange={(e) => handleUpdateStep(step.id, 'title', e.target.value)}
                            className="px-3 py-1.5 rounded-lg border border-[#D5C7BA] bg-white text-xs font-bold w-60 sm:w-80"
                            required
                          />
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1 text-xs text-[#5E5046]">
                            <Clock className="w-3.5 h-3.5" />
                            <input
                              type="number"
                              min={0}
                              placeholder="Mins"
                              value={step.timerMinutes || ''}
                              onChange={(e) => handleUpdateStep(step.id, 'timerMinutes', Number(e.target.value))}
                              className="w-16 px-2 py-1 rounded-lg border border-[#D5C7BA] bg-white text-xs tabular-nums text-center"
                            />
                            <span>mins</span>
                          </div>
                          {steps.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveStep(step.id)}
                              className="p-1.5 text-stone-400 hover:text-rose-600 rounded-lg hover:bg-white cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>

                      <textarea
                        rows={2}
                        placeholder="Detailed instructions, heat levels, visual indicators..."
                        value={step.description}
                        onChange={(e) => handleUpdateStep(step.id, 'description', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-[#D5C7BA] bg-white text-xs text-[#2D241E] focus:outline-none focus:ring-1 focus:ring-[#C46836]"
                        required
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 4: NUTRITION & PUBLISH / PUSH TOGGLE */}
            {activeTab === 'nutrition' && (
              <div className="space-y-5">
                <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E8DFD8] space-y-3">
                  <div className="text-xs font-bold uppercase tracking-wider text-[#5E5046]">
                    Nutritional Facts Estimation (Per Serving)
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="text-[11px] text-[#8C7A6B]">Calories (kcal)</label>
                      <input
                        type="number"
                        value={calories}
                        onChange={(e) => setCalories(Number(e.target.value))}
                        className="w-full mt-1 px-3 py-1.5 rounded-lg border border-[#D5C7BA] bg-white text-xs tabular-nums"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-[#8C7A6B]">Protein (g)</label>
                      <input
                        type="number"
                        value={protein}
                        onChange={(e) => setProtein(Number(e.target.value))}
                        className="w-full mt-1 px-3 py-1.5 rounded-lg border border-[#D5C7BA] bg-white text-xs tabular-nums"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-[#8C7A6B]">Carbs (g)</label>
                      <input
                        type="number"
                        value={carbs}
                        onChange={(e) => setCarbs(Number(e.target.value))}
                        className="w-full mt-1 px-3 py-1.5 rounded-lg border border-[#D5C7BA] bg-white text-xs tabular-nums"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-[#8C7A6B]">Total Fat (g)</label>
                      <input
                        type="number"
                        value={fat}
                        onChange={(e) => setFat(Number(e.target.value))}
                        className="w-full mt-1 px-3 py-1.5 rounded-lg border border-[#D5C7BA] bg-white text-xs tabular-nums"
                      />
                    </div>
                  </div>
                </div>

                {/* Status Selection (Draft vs Published) */}
                <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E8DFD8] space-y-3">
                  <div className="text-xs font-bold uppercase tracking-wider text-[#5E5046]">
                    Recipe Status (SRS FR-RCP-005)
                  </div>
                  <div className="flex gap-3">
                    <label className={`flex-1 flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition-all ${
                      status === 1 ? 'bg-white border-[#C46836] ring-1 ring-[#C46836]' : 'border-[#D5C7BA]'
                    }`}>
                      <input
                        type="radio"
                        name="status"
                        checked={status === 1}
                        onChange={() => setStatus(1)}
                        className="text-[#C46836] focus:ring-[#C46836]"
                      />
                      <div>
                        <div className="text-xs font-bold text-[#2D241E]">Publish to Public</div>
                        <div className="text-[11px] text-[#7C6E65]">Visible to all readers and search indexes</div>
                      </div>
                    </label>

                    <label className={`flex-1 flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition-all ${
                      status === 0 ? 'bg-white border-[#43362E] ring-1 ring-[#43362E]' : 'border-[#D5C7BA]'
                    }`}>
                      <input
                        type="radio"
                        name="status"
                        checked={status === 0}
                        onChange={() => setStatus(0)}
                        className="text-[#43362E]"
                      />
                      <div>
                        <div className="text-xs font-bold text-[#2D241E]">Save as Draft</div>
                        <div className="text-[11px] text-[#7C6E65]">Private to author and admin</div>
                      </div>
                    </label>
                  </div>
                </div>

                {/* AUTO PUSH DISPATCH TOGGLE */}
                {status === 1 && (
                  <div className="p-4 rounded-2xl bg-[#F0E6DD] border border-[#DFCEBF] space-y-2">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-xl bg-[#C46836] text-white flex items-center justify-center shrink-0 mt-0.5">
                        <Radio className="w-4 h-4 animate-pulse" />
                      </div>
                      <div className="flex-1">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={autoBroadcast}
                            onChange={(e) => setAutoBroadcast(e.target.checked)}
                            className="w-4 h-4 text-[#C46836] rounded focus:ring-[#C46836]"
                          />
                          <span className="text-xs font-bold text-[#2D241E]">
                            Automatically send instant push notifications to readers upon publishing
                          </span>
                        </label>
                        <p className="text-[11px] text-[#5E5046] mt-1 leading-relaxed">
                          The system will immediately dispatch a Web Push and audio chime alert to <strong>1,480 active subscribers</strong> so they discover your new recipe right away.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>

          {/* Modal Footer */}
          <div className="px-6 py-4 bg-[#FAF7F2] border-t border-[#E8DFD8] flex items-center justify-between">
            <div className="text-xs text-[#8C7A6B]">
              Author: <strong>{currentUser.displayName}</strong>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-[#7C6E65] hover:text-[#2D241E] hover:bg-[#F2ECE4] rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="flex items-center gap-1.5 px-6 py-2.5 text-xs font-bold text-white bg-[#43362E] hover:bg-[#2D241E] rounded-xl transition-all shadow-md hover:shadow-lg cursor-pointer"
              >
                {status === 1 && autoBroadcast && <Send className="w-3.5 h-3.5 text-[#C46836]" />}
                <span>{isEditing ? 'Save Changes' : status === 1 ? 'Publish & Push Alert' : 'Save as Draft'}</span>
              </button>
            </div>
          </div>
        </form>

      </div>
    </div>
  );
};
