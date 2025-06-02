import { create } from "zustand";
import { NoteWithCategory, CreateNoteInput, UpdateNoteInput } from "../types";
import { notesApi } from "../config/api";
import { useCategoriesStore } from "./categoriesStore";

interface NotesState {
  notes: NoteWithCategory[];
  isLoading: boolean;
  error: string | null;
  selectedNote: NoteWithCategory | null;

  // Actions
  fetchNotes: (getToken: () => Promise<string | null>) => Promise<void>;
  refreshNotesCategories: () => void;
  createNote: (
    noteData: CreateNoteInput,
    getToken: () => Promise<string | null>
  ) => Promise<void>;
  updateNote: (
    noteData: UpdateNoteInput,
    getToken: () => Promise<string | null>
  ) => Promise<void>;
  deleteNote: (
    id: string,
    getToken: () => Promise<string | null>
  ) => Promise<void>;
  setSelectedNote: (note: NoteWithCategory | null) => void;
  clearError: () => void;
}

export const useNotesStore = create<NotesState>((set, get) => ({
  notes: [],
  isLoading: false,
  error: null,
  selectedNote: null,

  fetchNotes: async (getToken: () => Promise<string | null>) => {
    set({ isLoading: true, error: null });
    try {
      const notes = await notesApi.getNotes(getToken);

      // Get the latest categories from the categories store
      const categoriesState = useCategoriesStore.getState();
      const categories = categoriesState.categories;

      const notesWithCategory = (notes || []).map((note) => {
        // Find the category for this note
        const category = note.categoryId
          ? categories.find((cat) => cat.id === note.categoryId) || null
          : null;

        return {
          ...note,
          category: category,
        } as NoteWithCategory;
      });

      set({ notes: notesWithCategory, isLoading: false });
    } catch (error) {
      // Since the API already handles 405 errors gracefully by returning empty array,
      // we should rarely reach this catch block. If we do, it means a serious error occurred.
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch notes";

      console.log(
        "⚠️ Unexpected error in notesStore.fetchNotes:",
        errorMessage
      );

      // Set empty array and no error message to prevent UI from showing error state
      // The API layer already handles the 405 gracefully
      set({
        notes: [],
        isLoading: false,
        error: null, // Don't show error to user for missing endpoints
      });
    }
  },

  refreshNotesCategories: () => {
    const currentNotes = get().notes;
    const categoriesState = useCategoriesStore.getState();
    const categories = categoriesState.categories;

    const notesWithUpdatedCategories = currentNotes.map((note) => {
      // Find the category for this note
      const category = note.categoryId
        ? categories.find((cat) => cat.id === note.categoryId) || null
        : null;

      return {
        ...note,
        category: category,
      };
    });

    set({ notes: notesWithUpdatedCategories });
  },

  createNote: async (
    noteData: CreateNoteInput,
    getToken: () => Promise<string | null>
  ) => {
    set({ isLoading: true, error: null });
    try {
      const newNote = await notesApi.createNote(noteData, getToken);

      // Get the latest categories from the categories store
      const categoriesState = useCategoriesStore.getState();
      const categories = categoriesState.categories;

      // Find the category for this note
      const category = newNote.categoryId
        ? categories.find((cat) => cat.id === newNote.categoryId) || null
        : null;

      const noteWithCategory = {
        ...newNote,
        category: category,
      } as NoteWithCategory;

      const currentNotes = get().notes;
      set({
        notes: [noteWithCategory, ...currentNotes],
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to create note",
        isLoading: false,
      });
      throw error;
    }
  },

  updateNote: async (
    noteData: UpdateNoteInput,
    getToken: () => Promise<string | null>
  ) => {
    set({ isLoading: true, error: null });
    try {
      const updatedNote = await notesApi.updateNote(noteData, getToken);

      // Get the latest categories from the categories store
      const categoriesState = useCategoriesStore.getState();
      const categories = categoriesState.categories;

      // Find the category for this note
      const category = updatedNote.categoryId
        ? categories.find((cat) => cat.id === updatedNote.categoryId) || null
        : null;

      const updatedNoteWithCategory = {
        ...updatedNote,
        category: category,
      } as NoteWithCategory;

      const currentNotes = get().notes;
      const updatedNotes = currentNotes.map((note) =>
        note.id === updatedNoteWithCategory.id ? updatedNoteWithCategory : note
      );
      set({
        notes: updatedNotes,
        isLoading: false,
        selectedNote:
          get().selectedNote?.id === updatedNoteWithCategory.id
            ? updatedNoteWithCategory
            : get().selectedNote,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to update note",
        isLoading: false,
      });
      throw error;
    }
  },

  deleteNote: async (id: string, getToken: () => Promise<string | null>) => {
    set({ isLoading: true, error: null });
    try {
      await notesApi.deleteNote(id, getToken);
      const currentNotes = get().notes;
      const filteredNotes = currentNotes.filter((note) => note.id !== id);
      set({
        notes: filteredNotes,
        isLoading: false,
        selectedNote: get().selectedNote?.id === id ? null : get().selectedNote,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to delete note",
        isLoading: false,
      });
      throw error;
    }
  },

  setSelectedNote: (note: NoteWithCategory | null) => {
    set({ selectedNote: note });
  },

  clearError: () => {
    set({ error: null });
  },
}));
