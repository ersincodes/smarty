import { create } from "zustand";
import { Category } from "../types";
import { categoriesApi } from "../config/api";

interface CategoriesState {
  categories: Category[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchCategories: (getToken: () => Promise<string | null>) => Promise<void>;
  createCategory: (
    name: string,
    getToken: () => Promise<string | null>
  ) => Promise<void>;
  deleteCategory: (
    id: string,
    getToken: () => Promise<string | null>
  ) => Promise<void>;
  clearError: () => void;
}

export const useCategoriesStore = create<CategoriesState>((set, get) => ({
  categories: [],
  isLoading: false,
  error: null,

  fetchCategories: async (getToken: () => Promise<string | null>) => {
    set({ isLoading: true, error: null });
    try {
      const categories = await categoriesApi.getCategories(getToken);
      set({ categories: categories || [], isLoading: false });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch categories";
      console.log(
        "⚠️ Unexpected error in categoriesStore.fetchCategories:",
        errorMessage
      );

      // Set empty array for graceful error handling
      set({
        categories: [],
        isLoading: false,
        error: null, // Don't show error to user for missing endpoints
      });
    }
  },

  createCategory: async (
    name: string,
    getToken: () => Promise<string | null>
  ) => {
    set({ isLoading: true, error: null });
    try {
      const newCategory = await categoriesApi.createCategory(
        { name, color: "#007AFF" },
        getToken
      );
      const currentCategories = get().categories;
      set({
        categories: [...currentCategories, newCategory],
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

  deleteCategory: async (
    id: string,
    getToken: () => Promise<string | null>
  ) => {
    set({ isLoading: true, error: null });
    try {
      await categoriesApi.deleteCategory(id, getToken);
      const currentCategories = get().categories;
      const filteredCategories = currentCategories.filter(
        (category) => category.id !== id
      );
      set({
        categories: filteredCategories,
        isLoading: false,
      });
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Failed to delete category",
        isLoading: false,
      });
      throw error;
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));
