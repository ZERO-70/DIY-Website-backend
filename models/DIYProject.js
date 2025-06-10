const mongoose = require("mongoose");

const diyProjectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      required: true,
      maxlength: 500,
    },
    category: {
      type: String,
      required: true,
      enum: [
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
      ],
    },
    difficulty: {
      type: String,
      required: true,
      enum: ["Beginner", "Intermediate", "Advanced"],
    },
    estimatedTime: {
      type: String,
      required: true, // e.g., "2-3 hours", "1 day", "1 week"
    },
    materials: [
      {
        name: { type: String, required: true },
        quantity: { type: String, required: true },
        estimatedCost: { type: Number }, // Optional cost in dollars
      },
    ],
    tools: [
      {
        name: { type: String, required: true },
        required: { type: Boolean, default: true },
      },
    ],
    steps: [
      {
        stepNumber: { type: Number, required: true },
        title: { type: String, required: true },
        description: { type: String, required: true },
        imageUrl: { type: String }, // Optional image for each step
        tips: [String], // Optional tips for this step
      },
    ],
    images: [
      {
        url: { type: String, required: true },
        caption: { type: String },
        isMainImage: { type: Boolean, default: false },
      },
    ],
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    comments: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        text: {
          type: String,
          required: true,
          maxlength: 500,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
        replies: [
          {
            user: {
              type: mongoose.Schema.Types.ObjectId,
              ref: "User",
              required: true,
            },
            text: {
              type: String,
              required: true,
              maxlength: 300,
            },
            createdAt: {
              type: Date,
              default: Date.now,
            },
          },
        ],
      },
    ],
    totalCost: {
      type: Number, // Calculated from materials
      default: 0,
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    views: {
      type: Number,
      default: 0,
    },
    completions: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        completedAt: {
          type: Date,
          default: Date.now,
        },
        rating: {
          type: Number,
          min: 1,
          max: 5,
        },
        review: {
          type: String,
          maxlength: 300,
        },
        images: [String], // URLs of user's completed project images
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Virtual for like count
diyProjectSchema.virtual("likeCount").get(function () {
  return this.likes.length;
});

// Virtual for comment count
diyProjectSchema.virtual("commentCount").get(function () {
  return this.comments.length;
});

// Virtual for completion count
diyProjectSchema.virtual("completionCount").get(function () {
  return this.completions.length;
});

// Virtual for average rating
diyProjectSchema.virtual("averageRating").get(function () {
  if (this.completions.length === 0) return 0;
  const ratingsWithValues = this.completions.filter((c) => c.rating);
  if (ratingsWithValues.length === 0) return 0;
  const sum = ratingsWithValues.reduce((acc, completion) => acc + completion.rating, 0);
  return (sum / ratingsWithValues.length).toFixed(1);
});

// Ensure virtual fields are serialized
diyProjectSchema.set("toJSON", { virtuals: true });
diyProjectSchema.set("toObject", { virtuals: true });

// Index for search functionality
diyProjectSchema.index({
  title: "text",
  description: "text",
  tags: "text",
  category: "text",
});

// Pre-save middleware to calculate total cost
diyProjectSchema.pre("save", function (next) {
  if (this.materials && this.materials.length > 0) {
    this.totalCost = this.materials.reduce((total, material) => {
      return total + (material.estimatedCost || 0);
    }, 0);
  }
  next();
});

module.exports = mongoose.model("DIYProject", diyProjectSchema);
