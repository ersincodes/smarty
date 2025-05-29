import type { NextApiRequest, NextApiResponse } from "next";

// Types
interface Note {
  id: string;
  title: string;
  content: string;
  categoryId: string | null;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

interface CreateNoteInput {
  title: string;
  content: string;
  categoryId?: string;
}

interface UpdateNoteInput {
  id: string;
  title: string;
  content: string;
  categoryId?: string;
}

// In-memory storage for testing
let notes: Note[] = [
  {
    id: "test-1",
    title: "Welcome to Smarty AI!",
    content: "This is your first note. The backend is working perfectly!",
    categoryId: "personal",
    userId: "test-user",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "test-2",
    title: "Backend Integration Complete",
    content:
      "Your React Native app can now communicate with the Next.js backend seamlessly.",
    categoryId: "work",
    userId: "test-user",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS"
    );
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization"
    );
    return res.status(200).end();
  }

  // Set CORS headers for all requests
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  try {
    // Simulate user authentication for testing - NO REAL AUTH REQUIRED
    const userId = "test-user";

    console.log(`[TEST ENDPOINT] ${req.method} /api/notes-test`);

    switch (req.method) {
      case "GET":
        return handleGetNotes(req, res, userId);
      case "POST":
        return handleCreateNote(req, res, userId);
      case "PUT":
        return handleUpdateNote(req, res, userId);
      case "DELETE":
        return handleDeleteNote(req, res, userId);
      default:
        res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE", "OPTIONS"]);
        return res
          .status(405)
          .json({ error: `Method ${req.method} not allowed` });
    }
  } catch (error) {
    console.error("API Error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

async function handleGetNotes(
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string
) {
  try {
    // Filter notes by user ID
    const userNotes = notes.filter((note) => note.userId === userId);

    return res.status(200).json({
      notes: userNotes,
    });
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch notes" });
  }
}

async function handleCreateNote(
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string
) {
  try {
    const { title, content, categoryId }: CreateNoteInput = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: "Title and content are required" });
    }

    const newNote: Note = {
      id: generateId(),
      title: title.trim(),
      content: content.trim(),
      categoryId: categoryId || null,
      userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    notes.push(newNote);

    return res.status(201).json({
      note: newNote,
    });
  } catch (error) {
    return res.status(500).json({ error: "Failed to create note" });
  }
}

async function handleUpdateNote(
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string
) {
  try {
    const { id, title, content, categoryId }: UpdateNoteInput = req.body;

    if (!id || !title || !content) {
      return res
        .status(400)
        .json({ error: "ID, title, and content are required" });
    }

    const noteIndex = notes.findIndex(
      (note) => note.id === id && note.userId === userId
    );

    if (noteIndex === -1) {
      return res.status(404).json({ error: "Note not found" });
    }

    // Update the note
    notes[noteIndex] = {
      ...notes[noteIndex],
      title: title.trim(),
      content: content.trim(),
      categoryId: categoryId || null,
      updatedAt: new Date(),
    };

    return res.status(200).json({
      note: notes[noteIndex],
    });
  } catch (error) {
    return res.status(500).json({ error: "Failed to update note" });
  }
}

async function handleDeleteNote(
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string
) {
  try {
    const { id } = req.body;

    if (!id) {
      return res.status(400).json({ error: "Note ID is required" });
    }

    const noteIndex = notes.findIndex(
      (note) => note.id === id && note.userId === userId
    );

    if (noteIndex === -1) {
      return res.status(404).json({ error: "Note not found" });
    }

    // Remove the note
    notes.splice(noteIndex, 1);

    return res.status(200).json({
      message: "Note deleted.",
    });
  } catch (error) {
    return res.status(500).json({ error: "Failed to delete note" });
  }
}

// Helper function to generate unique IDs
function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}
