import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  Note,
  CreateNoteRequest,
  UpdateNoteRequest,
  NoteFilter,
  SortOption,
  SortDirection,
} from "../types/note";

interface NotesState {
  notes: Note[];
  filteredNotes: Note[];
  filters: NoteFilter;
  sortBy: SortOption;
  sortDirection: SortDirection;
  isLoading: boolean;
  error: string | null;

  // Actions
  addNote: (note: CreateNoteRequest) => void;
  updateNote: (noteUpdate: UpdateNoteRequest) => void;
  deleteNote: (id: string) => void;
  toggleFavorite: (id: string) => void;
  toggleArchive: (id: string) => void;
  setFilters: (filters: Partial<NoteFilter>) => void;
  setSorting: (sortBy: SortOption, direction: SortDirection) => void;
  searchNotes: (query: string) => void;
  clearFilters: () => void;
  updateAISummary: (id: string, summary: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

const filterNotes = (notes: Note[], filters: NoteFilter): Note[] => {
  return notes.filter((note) => {
    if (
      filters.isArchived !== undefined &&
      note.isArchived !== filters.isArchived
    ) {
      return false;
    }

    if (
      filters.isFavorite !== undefined &&
      note.isFavorite !== filters.isFavorite
    ) {
      return false;
    }

    if (filters.category && note.category !== filters.category) {
      return false;
    }

    if (filters.tags && filters.tags.length > 0) {
      const hasAllTags = filters.tags.every((tag) => note.tags.includes(tag));
      if (!hasAllTags) return false;
    }

    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      const searchableText = `${note.title} ${note.content} ${note.tags.join(
        " "
      )}`.toLowerCase();
      if (!searchableText.includes(query)) {
        return false;
      }
    }

    return true;
  });
};

const sortNotes = (
  notes: Note[],
  sortBy: SortOption,
  direction: SortDirection
): Note[] => {
  return [...notes].sort((a, b) => {
    let aValue: any;
    let bValue: any;

    switch (sortBy) {
      case "createdAt":
        aValue = new Date(a.createdAt).getTime();
        bValue = new Date(b.createdAt).getTime();
        break;
      case "updatedAt":
        aValue = new Date(a.updatedAt).getTime();
        bValue = new Date(b.updatedAt).getTime();
        break;
      case "title":
        aValue = a.title.toLowerCase();
        bValue = b.title.toLowerCase();
        break;
      case "category":
        aValue = a.category?.toLowerCase() || "";
        bValue = b.category?.toLowerCase() || "";
        break;
      default:
        return 0;
    }

    if (direction === "asc") {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    }
  });
};

export const useNotesStore = create<NotesState>()(
  persist(
    (set, get) => ({
      notes: [],
      filteredNotes: [],
      filters: {},
      sortBy: "updatedAt",
      sortDirection: "desc",
      isLoading: false,
      error: null,

      addNote: (noteRequest: CreateNoteRequest) => {
        const newNote: Note = {
          id: Date.now().toString(),
          ...noteRequest,
          tags: noteRequest.tags || [],
          createdAt: new Date(),
          updatedAt: new Date(),
          isAIGenerated: false,
          isFavorite: false,
          isArchived: false,
        };

        set((state) => {
          const newNotes = [newNote, ...state.notes];
          const filtered = filterNotes(newNotes, state.filters);
          const sorted = sortNotes(filtered, state.sortBy, state.sortDirection);

          return {
            notes: newNotes,
            filteredNotes: sorted,
          };
        });
      },

      updateNote: (noteUpdate: UpdateNoteRequest) => {
        set((state) => {
          const updatedNotes = state.notes.map((note) =>
            note.id === noteUpdate.id
              ? { ...note, ...noteUpdate, updatedAt: new Date() }
              : note
          );

          const filtered = filterNotes(updatedNotes, state.filters);
          const sorted = sortNotes(filtered, state.sortBy, state.sortDirection);

          return {
            notes: updatedNotes,
            filteredNotes: sorted,
          };
        });
      },

      deleteNote: (id: string) => {
        set((state) => {
          const updatedNotes = state.notes.filter((note) => note.id !== id);
          const filtered = filterNotes(updatedNotes, state.filters);
          const sorted = sortNotes(filtered, state.sortBy, state.sortDirection);

          return {
            notes: updatedNotes,
            filteredNotes: sorted,
          };
        });
      },

      toggleFavorite: (id: string) => {
        const { updateNote } = get();
        const note = get().notes.find((n) => n.id === id);
        if (note) {
          updateNote({ id, isFavorite: !note.isFavorite });
        }
      },

      toggleArchive: (id: string) => {
        const { updateNote } = get();
        const note = get().notes.find((n) => n.id === id);
        if (note) {
          updateNote({ id, isArchived: !note.isArchived });
        }
      },

      setFilters: (newFilters: Partial<NoteFilter>) => {
        set((state) => {
          const filters = { ...state.filters, ...newFilters };
          const filtered = filterNotes(state.notes, filters);
          const sorted = sortNotes(filtered, state.sortBy, state.sortDirection);

          return {
            filters,
            filteredNotes: sorted,
          };
        });
      },

      setSorting: (sortBy: SortOption, direction: SortDirection) => {
        set((state) => {
          const sorted = sortNotes(state.filteredNotes, sortBy, direction);

          return {
            sortBy,
            sortDirection: direction,
            filteredNotes: sorted,
          };
        });
      },

      searchNotes: (query: string) => {
        const { setFilters } = get();
        setFilters({ searchQuery: query });
      },

      clearFilters: () => {
        set((state) => {
          const sorted = sortNotes(
            state.notes,
            state.sortBy,
            state.sortDirection
          );

          return {
            filters: {},
            filteredNotes: sorted,
          };
        });
      },

      updateAISummary: (id: string, summary: string) => {
        const { updateNote } = get();
        updateNote({ id, aiSummary: summary });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      setError: (error: string | null) => {
        set({ error });
      },
    }),
    {
      name: "notes-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        notes: state.notes,
        filters: state.filters,
        sortBy: state.sortBy,
        sortDirection: state.sortDirection,
      }),
    }
  )
);
