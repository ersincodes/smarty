import { create } from "zustand";
import { Category } from "../types";
import { categoriesApi } from "../config/api";

interface CategoriesState {
  categories: Category[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchCategories: () => Promise<void>;
  createCategory: (name: string) => Promise<void>;
  clearError: () => void;
}

export const useCategoriesStore = create<CategoriesState>((set, get) => ({
  categories: [],
  isLoading: false,
  error: null,

  fetchCategories: async () => {
    set({ isLoading: true, error: null });
    try {
      const categories = await categoriesApi.getCategories();
      set({ categories, isLoading: false });
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Failed to fetch categories",
        isLoading: false,
      });
    }
  },

  createCategory: async (name: string) => {
    set({ isLoading: true, error: null });
    try {
      const newCategory = await categoriesApi.createCategory(name);
      const currentCategories = get().categories;
      set({
        categories: [newCategory, ...currentCategories],
        isLoading: false,
      });
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Failed to create category",
        isLoading: false,
      });
      throw error;
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));
