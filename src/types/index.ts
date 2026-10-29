export type DifficultyLevel = 1 | 2 | 3 | 4; // 1: Dễ, 2: Trung bình, 3: Khó, 4: Chuyên gia
export type RecipeStatus = 0 | 1 | 2; // 0: Draft, 1: Published, 2: Archived

export interface RecipeNutrition {
  calories: number; // kcal
  protein: number; // g
  carbohydrates: number; // g
  fat: number; // g
  fiber?: number; // g
  sodium?: number; // mg
}

export interface RecipeIngredient {
  id: string;
  recipeId: string;
  name: string;
  quantity?: number;
  unit?: string;
  notes?: string;
  orderIndex: number;
}

export interface RecipeStep {
  id: string;
  recipeId: string;
  stepNumber: number;
  title: string;
  description: string;
  timerMinutes?: number;
  imageUrl?: string;
}

export interface RecipeImage {
  id: string;
  recipeId: string;
  originalUrl: string;
  mediumUrl?: string;
  thumbnailUrl?: string;
  altText?: string;
  isPrimary: boolean;
  orderIndex: number;
}

export interface Recipe {
  id: string;
  title: string;
  slug: string;
  description: string;
  instructions: string;
  prepTime: number; // minutes
  cookTime: number; // minutes
  servings: number;
  difficulty: DifficultyLevel;
  status: RecipeStatus;
  categoryId: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  authorRole?: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt?: string;
  nutrition: RecipeNutrition;
  ingredients: RecipeIngredient[];
  steps: RecipeStep[];
  images: RecipeImage[];
  viewsCount?: number;
  likesCount?: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  orderIndex: number;
  recipeCount: number;
}

export interface ApplicationUser {
  id: string;
  displayName: string;
  email: string;
  userName: string;
  avatarUrl?: string;
  bio?: string;
  roles: ('Guest' | 'Author' | 'Admin')[];
  isActive: boolean;
  createdAt: string;
}

export interface PushNotification {
  id: string;
  title: string;
  message: string;
  recipeId?: string;
  recipeSlug?: string;
  recipeTitle?: string;
  recipeImage?: string;
  authorName?: string;
  sentAt: string;
  read: boolean;
  priority: 'standard' | 'urgent' | 'daily_pick';
  segment: string;
  reachCount: number;
}

export interface Subscriber {
  id: string;
  name: string;
  email: string;
  device: string;
  subscribedAt: string;
  status: 'active' | 'muted';
}
