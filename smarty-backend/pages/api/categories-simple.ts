import type { NextApiRequest, NextApiResponse } from "next";

// Simple category type
interface SimpleCategory {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

// In-memory storage for testing
let simpleCategories: SimpleCategory[] = [
  {
    id: "simple-1",
    name: "Personal",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "simple-2",
    name: "Work",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "simple-3",
    name: "Ideas",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "simple-4",
    name: "Learning",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
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

  console.log(`[SIMPLE CATEGORIES] ${req.method} /api/categories-simple`);

  try {
    switch (req.method) {
      case "GET":
        return res.status(200).json({
          success: true,
          categories: simpleCategories,
          message: "Simple categories endpoint working!",
        });

      case "POST":
        const { name } = req.body;

        if (!name || typeof name !== "string") {
          return res.status(400).json({
            error: "Category name is required",
            received: { name },
          });
        }

        // Check if category already exists
        const existingCategory = simpleCategories.find(
          (cat) => cat.name.toLowerCase() === name.toLowerCase()
        );

        if (existingCategory) {
          return res.status(400).json({
            error: "Category already exists",
            existing: existingCategory,
          });
        }

        const newCategory: SimpleCategory = {
          id: `simple-${Date.now()}`,
          name: name.trim(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        simpleCategories.push(newCategory);

        return res.status(201).json({
          success: true,
          category: newCategory,
          message: "Category created successfully!",
        });

      case "DELETE":
        const { id } = req.body;

        if (!id) {
          return res.status(400).json({
            error: "Category ID is required",
            received: { id },
          });
        }

        const categoryIndex = simpleCategories.findIndex(
          (cat) => cat.id === id
        );

        if (categoryIndex === -1) {
          return res.status(404).json({ error: "Category not found" });
        }

        // Remove the category
        const deletedCategory = simpleCategories.splice(categoryIndex, 1)[0];

        return res.status(200).json({
          success: true,
          deletedCategory,
          message: "Category deleted successfully!",
        });

      default:
        res.setHeader("Allow", ["GET", "POST", "DELETE", "OPTIONS"]);
        return res.status(405).json({
          error: `Method ${req.method} not allowed`,
          allowedMethods: ["GET", "POST", "DELETE", "OPTIONS"],
        });
    }
  } catch (error) {
    console.error("Simple Categories API Error:", error);
    return res.status(500).json({
      error: "Internal server error",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
