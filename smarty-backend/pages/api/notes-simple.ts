import type { NextApiRequest, NextApiResponse } from "next";

// Simple note type
interface SimpleNote {
  id: string;
  title: string;
  content: string;
  userId: string;
  createdAt: string;
}

// In-memory storage for testing
let simpleNotes: SimpleNote[] = [
  {
    id: "simple-1",
    title: "🎉 Backend Connected!",
    content:
      "Your React Native app is successfully connected to the Next.js backend!",
    userId: "test-user",
    createdAt: new Date().toISOString(),
  },
  {
    id: "simple-2",
    title: "📱 API Working",
    content: "This endpoint works without authentication for testing purposes.",
    userId: "test-user",
    createdAt: new Date().toISOString(),
  },
];

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Handle CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  console.log(`[SIMPLE ENDPOINT] ${req.method} /api/notes-simple`);

  try {
    switch (req.method) {
      case "GET":
        return res.status(200).json({
          success: true,
          notes: simpleNotes,
          message: "Simple notes endpoint working!",
        });

      case "POST":
        const { title, content } = req.body;

        if (!title || !content) {
          return res.status(400).json({
            error: "Title and content are required",
            received: { title, content },
          });
        }

        const newNote: SimpleNote = {
          id: `simple-${Date.now()}`,
          title: title.trim(),
          content: content.trim(),
          userId: "test-user",
          createdAt: new Date().toISOString(),
        };

        simpleNotes.push(newNote);

        return res.status(201).json({
          success: true,
          note: newNote,
          message: "Note created successfully!",
        });

      default:
        res.setHeader("Allow", ["GET", "POST", "OPTIONS"]);
        return res.status(405).json({
          error: `Method ${req.method} not allowed`,
          allowedMethods: ["GET", "POST", "OPTIONS"],
        });
    }
  } catch (error) {
    console.error("Simple API Error:", error);
    return res.status(500).json({
      error: "Internal server error",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
