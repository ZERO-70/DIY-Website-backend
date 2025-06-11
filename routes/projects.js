const express = require("express");
const router = express.Router();
const DIYProject = require("../models/DIYProject");
const User = require("../models/User");
const { authMiddleware, optionalAuth } = require("../middleware/auth");

// Get all projects (with pagination and filtering) - Feed endpoint
router.get("/", optionalAuth, async (req, res) => {
  try {
    console.log("=== PROJECTS GET REQUEST ===");
    console.log("Query params:", req.query);
    console.log("User:", req.user ? req.user.username : "Not authenticated");

    const {
      page = 1,
      limit = 12,
      category,
      difficulty,
      search,
      sortBy = "createdAt",
      sortOrder = "desc",
      featured,
    } = req.query;

    // Build filter object
    const filter = { isPublished: true };

    if (category && category !== "all") {
      filter.category = category;
    }

    if (difficulty && difficulty !== "all") {
      filter.difficulty = difficulty;
    }

    if (featured === "true") {
      filter.isFeatured = true;
    }

    // Build search query
    let searchQuery = {};
    if (search) {
      searchQuery = {
        $or: [
          { title: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },
          { tags: { $in: [new RegExp(search, "i")] } },
          { category: { $regex: search, $options: "i" } },
        ],
      };
    }

    // Combine filters
    const finalFilter = { ...filter, ...searchQuery };

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    // Execute query with pagination
    const projects = await DIYProject.find(finalFilter)
      .populate("author", "username")
      .populate("comments.user", "username")
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    // Get total count for pagination
    const total = await DIYProject.countDocuments(finalFilter);
    console.log(
      `Fetched ${projects.length} projects for page ${page} with filter:`,
      finalFilter
    );

    // Add user-specific data if authenticated
    const projectsWithUserData = projects.map((project) => {
      const projectObj = {
        ...project,
        isLiked: req.user
          ? project.likes.some(
              (like) => like.toString() === req.user._id.toString()
            )
          : false,
        isSaved: req.user
          ? req.user.savedProjects.some(
              (saved) => saved.toString() === project._id.toString()
            )
          : false,
      };
      return projectObj;
    });

    res.json({
      projects: projectsWithUserData,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      totalProjects: total,
      hasNextPage: page < Math.ceil(total / limit),
      hasPrevPage: page > 1,
    });
  } catch (error) {
    console.error("Get projects error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Get single project by ID
router.get("/:id", optionalAuth, async (req, res) => {
  try {
    const project = await DIYProject.findById(req.params.id)
      .populate("author", "username email")
      .populate("comments.user", "username")
      .populate("comments.replies.user", "username")
      .populate("completions.user", "username");

    if (!project || !project.isPublished) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Increment view count
    project.views += 1;
    await project.save();

    // Add user-specific data if authenticated
    const projectData = {
      ...project.toObject(),
      isLiked: req.user
        ? project.likes.some(
            (like) => like.toString() === req.user._id.toString()
          )
        : false,
      isSaved: req.user
        ? req.user.savedProjects.some(
            (saved) => saved.toString() === project._id.toString()
          )
        : false,
      isAuthor: req.user
        ? project.author._id.toString() === req.user._id.toString()
        : false,
    };

    res.json(projectData);
  } catch (error) {
    console.error("Get project error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Create new project
router.post("/", authMiddleware, async (req, res) => {
  try {
    console.log("Received project data:", JSON.stringify(req.body, null, 2));
    console.log("Category received:", req.body.category);
    console.log("Category type:", typeof req.body.category);
    console.log("Category length:", req.body.category?.length);

    const projectData = {
      ...req.body,
      author: req.user._id,
    };

    const project = new DIYProject(projectData);
    const savedProject = await project.save();

    const populatedProject = await DIYProject.findById(
      savedProject._id
    ).populate("author", "username");

    res.status(201).json(populatedProject);
  } catch (error) {
    console.error("Create project error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Update project
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const project = await DIYProject.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Check if user is the author
    if (project.author.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this project" });
    }

    const updatedProject = await DIYProject.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate("author", "username");

    res.json(updatedProject);
  } catch (error) {
    console.error("Update project error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Delete project
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const project = await DIYProject.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Check if user is the author
    if (project.author.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this project" });
    }

    await DIYProject.findByIdAndDelete(req.params.id);
    res.json({ message: "Project deleted successfully" });
  } catch (error) {
    console.error("Delete project error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Like/Unlike project
router.post("/:id/like", authMiddleware, async (req, res) => {
  try {
    const project = await DIYProject.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const userIndex = project.likes.indexOf(req.user._id);

    if (userIndex > -1) {
      // Unlike
      project.likes.splice(userIndex, 1);
    } else {
      // Like
      project.likes.push(req.user._id);
    }

    await project.save();

    res.json({
      liked: userIndex === -1,
      likeCount: project.likes.length,
    });
  } catch (error) {
    console.error("Like project error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Save/Unsave project
router.post("/:id/save", authMiddleware, async (req, res) => {
  try {
    const project = await DIYProject.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const user = await User.findById(req.user._id);
    const projectIndex = user.savedProjects.indexOf(req.params.id);

    if (projectIndex > -1) {
      // Unsave
      user.savedProjects.splice(projectIndex, 1);
    } else {
      // Save
      user.savedProjects.push(req.params.id);
    }

    await user.save();

    res.json({
      saved: projectIndex === -1,
      message:
        projectIndex === -1 ? "Project saved" : "Project removed from saved",
    });
  } catch (error) {
    console.error("Save project error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Add comment to project
router.post("/:id/comments", authMiddleware, async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ message: "Comment text is required" });
    }

    const project = await DIYProject.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const newComment = {
      user: req.user._id,
      text: text.trim(),
      createdAt: new Date(),
    };

    project.comments.push(newComment);
    await project.save();

    // Populate the new comment
    await project.populate("comments.user", "username");

    const addedComment = project.comments[project.comments.length - 1];

    res.status(201).json(addedComment);
  } catch (error) {
    console.error("Add comment error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Get projects by category
router.get("/category/:category", optionalAuth, async (req, res) => {
  try {
    const { category } = req.params;
    const {
      page = 1,
      limit = 12,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const filter = { category, isPublished: true };
    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    const projects = await DIYProject.find(filter)
      .populate("author", "username")
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const total = await DIYProject.countDocuments(filter);

    const projectsWithUserData = projects.map((project) => ({
      ...project,
      isLiked: req.user
        ? project.likes.some(
            (like) => like.toString() === req.user._id.toString()
          )
        : false,
      isSaved: req.user
        ? req.user.savedProjects.some(
            (saved) => saved.toString() === project._id.toString()
          )
        : false,
    }));

    res.json({
      projects: projectsWithUserData,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      totalProjects: total,
      category,
    });
  } catch (error) {
    console.error("Get projects by category error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Get featured projects
router.get("/featured/list", optionalAuth, async (req, res) => {
  try {
    const { limit = 6 } = req.query;

    const projects = await DIYProject.find({
      isFeatured: true,
      isPublished: true,
    })
      .populate("author", "username")
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .lean();

    const projectsWithUserData = projects.map((project) => ({
      ...project,
      isLiked: req.user
        ? project.likes.some(
            (like) => like.toString() === req.user._id.toString()
          )
        : false,
      isSaved: req.user
        ? req.user.savedProjects.some(
            (saved) => saved.toString() === project._id.toString()
          )
        : false,
    }));

    res.json(projectsWithUserData);
  } catch (error) {
    console.error("Get featured projects error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Get user's saved projects
router.get("/saved/list", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: "savedProjects",
      populate: {
        path: "author",
        select: "username",
      },
    });

    const projectsWithUserData = user.savedProjects.map((project) => ({
      ...project.toObject(),
      isLiked: project.likes.some(
        (like) => like.toString() === req.user._id.toString()
      ),
      isSaved: true,
    }));

    res.json(projectsWithUserData);
  } catch (error) {
    console.error("Get saved projects error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Get project statistics
router.get("/stats/overview", async (req, res) => {
  try {
    const totalProjects = await DIYProject.countDocuments({
      isPublished: true,
    });
    const totalUsers = await User.countDocuments();

    // Get category counts
    const categoryStats = await DIYProject.aggregate([
      { $match: { isPublished: true } },
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // Get difficulty distribution
    const difficultyStats = await DIYProject.aggregate([
      { $match: { isPublished: true } },
      { $group: { _id: "$difficulty", count: { $sum: 1 } } },
    ]);

    // Get recent activity (projects from last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentProjects = await DIYProject.countDocuments({
      isPublished: true,
      createdAt: { $gte: thirtyDaysAgo },
    });

    res.json({
      totalProjects,
      totalUsers,
      recentProjects,
      categoryStats,
      difficultyStats,
    });
  } catch (error) {
    console.error("Get stats error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Get available categories
router.get("/categories/list", async (req, res) => {
  try {
    const categories = [
      "Woodworking",
      "Home Decor",
      "Crafts & Sewing",
      "Garden & Outdoor",
      "Electronics",
      "Kitchen & Food",
      "Furniture",
      "Art & Painting",
      "Jewelry",
      "Other",
    ];

    // Get project count for each category
    const categoriesWithCounts = await Promise.all(
      categories.map(async (category) => {
        const count = await DIYProject.countDocuments({
          category,
          isPublished: true,
        });
        return { name: category, count };
      })
    );

    res.json(categoriesWithCounts);
  } catch (error) {
    console.error("Get categories error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
