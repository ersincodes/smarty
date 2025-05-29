import { create } from "zustand";
import { NoteWithCategory, CreateNoteInput, UpdateNoteInput } from "../types";
import { notesApi } from "../config/api";

interface NotesState {
  notes: NoteWithCategory[];
  isLoading: boolean;
  error: string | null;
  selectedNote: NoteWithCategory | null;

  // Actions
  fetchNotes: (getToken: () => Promise<string | null>) => Promise<void>;
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
      const notesWithCategory = notes.map((note) => ({
        ...note,
        category: note.category || null,
      })) as NoteWithCategory[];
      set({ notes: notesWithCategory, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to fetch notes",
        isLoading: false,
      });
    }
  },

  createNote: async (
    noteData: CreateNoteInput,
    getToken: () => Promise<string | null>
  ) => {
    set({ isLoading: true, error: null });
    try {
      const newNote = await notesApi.createNote(noteData, getToken);
      const noteWithCategory = {
        ...newNote,
        category: newNote.category || null,
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
      const updatedNoteWithCategory = {
        ...updatedNote,
        category: updatedNote.category || null,
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
