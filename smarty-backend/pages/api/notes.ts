import type { NextApiRequest, NextApiResponse } from "next";

// Check if Clerk is available, if not, provide fallback
let getAuth: any;
try {
  const clerkModule = require("@clerk/nextjs/server");
  getAuth = clerkModule.getAuth;
} catch (error) {
  console.warn("Clerk not available, using fallback authentication");
  getAuth = () => ({ userId: null });
}

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

// In-memory storage for development (replace with actual database)
let notes: Note[] = [];

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
    console.log(`[NOTES ENDPOINT] ${req.method} /api/notes`);

    // Get user authentication
    let userId: string | null = null;

    try {
      const authResult = getAuth(req);
      userId = authResult?.userId || null;
      console.log("Auth result:", { userId: userId ? "found" : "not found" });
    } catch (authError) {
      console.error("Authentication error:", authError);
      return res.status(401).json({
        error: "Authentication failed",
        details:
          "Clerk authentication is not properly configured. Please check your CLERK_SECRET_KEY environment variable.",
        hint: "Use /notes-test or /api/notes-simple for testing without authentication",
      });
    }

    if (!userId) {
      return res.status(401).json({
        error: "Unauthorized - No user ID found",
        details:
          "Please ensure you are signed in and your authentication token is valid.",
        hint: "Use /notes-test or /api/notes-simple for testing without authentication",
      });
    }

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
    return res.status(500).json({
      error: "Internal server error",
      details: error instanceof Error ? error.message : "Unknown error",
    });
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

    // TODO: Add vector embedding generation here
    // await generateEmbedding(newNote);

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

    // TODO: Regenerate vector embedding
    // await updateEmbedding(notes[noteIndex]);

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

    // TODO: Remove from vector index
    // await removeFromVectorIndex(id);

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
