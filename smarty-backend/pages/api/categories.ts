import type { NextApiRequest, NextApiResponse } from "next";
import { getAuth } from "@clerk/nextjs/server";

// Types
interface Category {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

// In-memory storage for development (replace with actual database)
let categories: Category[] = [
  {
    id: "default-1",
    name: "Personal",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "default-2",
    name: "Work",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "default-3",
    name: "Ideas",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Get user authentication
    const { userId } = getAuth(req);

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    switch (req.method) {
      case "GET":
        return handleGetCategories(req, res, userId);
      case "POST":
        return handleCreateCategory(req, res, userId);
      case "DELETE":
        return handleDeleteCategory(req, res, userId);
      default:
        res.setHeader("Allow", ["GET", "POST", "DELETE"]);
        return res
          .status(405)
          .json({ error: `Method ${req.method} not allowed` });
    }
  } catch (error) {
    console.error("Categories API Error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

async function handleGetCategories(
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string
) {
  try {
    // Return all categories (in a real app, you might filter by user)
    return res.status(200).json({
      categories: categories,
    });
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch categories" });
  }
}

async function handleCreateCategory(
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string
) {
  try {
    const { name } = req.body;

    if (!name || typeof name !== "string") {
      return res.status(400).json({ error: "Category name is required" });
    }

    // Check if category already exists
    const existingCategory = categories.find(
      (cat) => cat.name.toLowerCase() === name.toLowerCase()
    );

    if (existingCategory) {
      return res.status(400).json({ error: "Category already exists" });
    }

    const newCategory: Category = {
      id: generateId(),
      name: name.trim(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    categories.push(newCategory);

    return res.status(201).json({
      category: newCategory,
    });
  } catch (error) {
    return res.status(500).json({ error: "Failed to create category" });
  }
}

async function handleDeleteCategory(
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string
) {
  try {
    const { id } = req.body;

    if (!id) {
      return res.status(400).json({ error: "Category ID is required" });
    }

    const categoryIndex = categories.findIndex((cat) => cat.id === id);

    if (categoryIndex === -1) {
      return res.status(404).json({ error: "Category not found" });
    }

    // Remove the category
    categories.splice(categoryIndex, 1);

    return res.status(200).json({
      message: "Category deleted.",
    });
  } catch (error) {
    return res.status(500).json({ error: "Failed to delete category" });
  }
}

// Helper function to generate unique IDs
function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}
