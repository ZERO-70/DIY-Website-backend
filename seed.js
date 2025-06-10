const mongoose = require("mongoose");
const DIYProject = require("./models/DIYProject");
const User = require("./models/User");
require("dotenv").config();

const seedProjects = [
  {
    title: "Rustic Wooden Coffee Table",
    description:
      "Build a beautiful rustic coffee table using reclaimed wood. Perfect for adding a cozy touch to your living room.",
    category: "Woodworking",
    difficulty: "Intermediate",
    estimatedTime: "1-2 days",
    materials: [
      {
        name: "Reclaimed wood planks",
        quantity: "8 pieces",
        estimatedCost: 50,
      },
      { name: "Wood screws", quantity: "1 box", estimatedCost: 10 },
      { name: "Wood stain", quantity: "1 bottle", estimatedCost: 15 },
      { name: "Sandpaper", quantity: "Various grits", estimatedCost: 12 },
    ],
    tools: [
      { name: "Circular saw", required: true },
      { name: "Drill", required: true },
      { name: "Sander", required: false },
      { name: "Measuring tape", required: true },
    ],
    steps: [
      {
        stepNumber: 1,
        title: "Cut the wood to size",
        description:
          "Measure and cut all wooden pieces according to the plan dimensions.",
        tips: ["Always measure twice, cut once", "Use proper safety equipment"],
      },
      {
        stepNumber: 2,
        title: "Sand all pieces",
        description:
          "Sand all wooden pieces starting with coarse grit and finishing with fine grit.",
        tips: ["Sand with the grain", "Clean dust between grits"],
      },
      {
        stepNumber: 3,
        title: "Assemble the frame",
        description:
          "Join the wooden pieces together using wood screws and ensure everything is square.",
        tips: [
          "Pre-drill holes to prevent splitting",
          "Use clamps for better alignment",
        ],
      },
      {
        stepNumber: 4,
        title: "Apply finish",
        description:
          "Apply wood stain evenly and let dry completely between coats.",
        tips: ["Use thin coats", "Work in well-ventilated area"],
      },
    ],
    images: [
      {
        url: "https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=800",
        caption: "Finished coffee table",
        isMainImage: true,
      },
    ],
    tags: ["rustic", "furniture", "living room", "beginner-friendly"],
    isFeatured: true,
  },
  {
    title: "Mason Jar Herb Garden",
    description:
      "Create a beautiful hanging herb garden using mason jars. Perfect for small spaces and beginners.",
    category: "Garden & Outdoor",
    difficulty: "Beginner",
    estimatedTime: "2-3 hours",
    materials: [
      { name: "Mason jars", quantity: "6 pieces", estimatedCost: 18 },
      { name: "Hose clamps", quantity: "6 pieces", estimatedCost: 12 },
      { name: "Wooden board", quantity: "1 piece", estimatedCost: 15 },
      { name: "Potting soil", quantity: "1 bag", estimatedCost: 8 },
      { name: "Herb seeds", quantity: "Various", estimatedCost: 20 },
    ],
    tools: [
      { name: "Drill", required: true },
      { name: "Screwdriver", required: true },
      { name: "Level", required: true },
    ],
    steps: [
      {
        stepNumber: 1,
        title: "Prepare the mounting board",
        description: "Cut and sand the wooden board to desired length.",
      },
      {
        stepNumber: 2,
        title: "Attach hose clamps",
        description: "Secure hose clamps to the board at regular intervals.",
      },
      {
        stepNumber: 3,
        title: "Mount the board",
        description: "Securely mount the board to wall or fence.",
      },
      {
        stepNumber: 4,
        title: "Plant herbs",
        description: "Fill jars with soil and plant your chosen herbs.",
        tips: [
          "Choose herbs that don't require deep roots",
          "Ensure proper drainage",
        ],
      },
    ],
    images: [
      {
        url: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800",
        caption: "Mason jar herb garden",
        isMainImage: true,
      },
    ],
    tags: ["herbs", "garden", "mason jars", "small space"],
    isFeatured: true,
  },
  {
    title: "Macrame Wall Hanging",
    description:
      "Learn the art of macrame by creating this beautiful wall hanging. Perfect for boho decor enthusiasts.",
    category: "Crafts & Sewing",
    difficulty: "Beginner",
    estimatedTime: "3-4 hours",
    materials: [
      { name: "Macrame cord", quantity: "100 yards", estimatedCost: 25 },
      { name: "Wooden dowel", quantity: "1 piece", estimatedCost: 5 },
      { name: "Scissors", quantity: "1 pair", estimatedCost: 8 },
    ],
    tools: [
      { name: "Comb", required: true },
      { name: "Measuring tape", required: true },
    ],
    steps: [
      {
        stepNumber: 1,
        title: "Cut the cord",
        description:
          "Cut macrame cord into required lengths according to pattern.",
      },
      {
        stepNumber: 2,
        title: "Attach to dowel",
        description:
          "Secure cords to the wooden dowel using lark's head knots.",
      },
      {
        stepNumber: 3,
        title: "Create the pattern",
        description: "Follow the macrame pattern using various knots.",
        tips: ["Keep tension consistent", "Count your knots carefully"],
      },
      {
        stepNumber: 4,
        title: "Finish the ends",
        description: "Trim and comb out the ends for a frayed effect.",
      },
    ],
    images: [
      {
        url: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800",
        caption: "Macrame wall hanging",
        isMainImage: true,
      },
    ],
    tags: ["macrame", "wall decor", "boho", "handmade"],
  },
  {
    title: "Smart Home LED Strip Controller",
    description:
      "Build your own WiFi-controlled LED strip system using Arduino. Perfect for tech enthusiasts.",
    category: "Electronics",
    difficulty: "Advanced",
    estimatedTime: "1 week",
    materials: [
      { name: "Arduino ESP32", quantity: "1 piece", estimatedCost: 20 },
      { name: "LED strip", quantity: "5 meters", estimatedCost: 30 },
      { name: "Resistors", quantity: "Various", estimatedCost: 5 },
      { name: "Breadboard", quantity: "1 piece", estimatedCost: 8 },
      { name: "Jumper wires", quantity: "1 set", estimatedCost: 10 },
    ],
    tools: [
      { name: "Soldering iron", required: true },
      { name: "Multimeter", required: true },
      { name: "Computer", required: true },
    ],
    steps: [
      {
        stepNumber: 1,
        title: "Setup Arduino IDE",
        description: "Install Arduino IDE and ESP32 board support.",
      },
      {
        stepNumber: 2,
        title: "Wire the circuit",
        description: "Connect LED strip to ESP32 according to circuit diagram.",
        tips: ["Double-check connections", "Use proper voltage levels"],
      },
      {
        stepNumber: 3,
        title: "Program the microcontroller",
        description: "Upload the LED control code to ESP32.",
      },
      {
        stepNumber: 4,
        title: "Create mobile app interface",
        description: "Set up web interface for controlling the LEDs.",
      },
    ],
    images: [
      {
        url: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800",
        caption: "LED strip setup",
        isMainImage: true,
      },
    ],
    tags: ["arduino", "smart home", "led", "electronics", "automation"],
  },
  {
    title: "Farmhouse Style Floating Shelves",
    description:
      "Create beautiful floating shelves with a farmhouse aesthetic. Great for displaying books and decor.",
    category: "Home Decor",
    difficulty: "Intermediate",
    estimatedTime: "4-6 hours",
    materials: [
      { name: "Pine boards", quantity: "3 pieces", estimatedCost: 35 },
      {
        name: "Floating shelf brackets",
        quantity: "6 pieces",
        estimatedCost: 25,
      },
      { name: "Wood screws", quantity: "1 box", estimatedCost: 8 },
      { name: "White paint", quantity: "1 quart", estimatedCost: 15 },
    ],
    tools: [
      { name: "Circular saw", required: true },
      { name: "Drill", required: true },
      { name: "Level", required: true },
      { name: "Stud finder", required: true },
    ],
    steps: [
      {
        stepNumber: 1,
        title: "Cut boards to length",
        description: "Measure and cut pine boards to desired shelf lengths.",
      },
      {
        stepNumber: 2,
        title: "Sand and paint",
        description: "Sand boards smooth and apply primer and paint.",
        tips: ["Use thin coats of paint", "Sand between coats"],
      },
      {
        stepNumber: 3,
        title: "Install brackets",
        description: "Mount floating shelf brackets securely to wall studs.",
      },
      {
        stepNumber: 4,
        title: "Mount shelves",
        description: "Slide shelves onto brackets and ensure they're level.",
      },
    ],
    images: [
      {
        url: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800",
        caption: "Farmhouse floating shelves",
        isMainImage: true,
      },
    ],
    tags: ["floating shelves", "farmhouse", "wall decor", "storage"],
    isFeatured: true,
  },
  {
    title: "Homemade Sourdough Bread",
    description:
      "Master the art of sourdough bread making from scratch. Includes starter creation and maintenance tips.",
    category: "Kitchen & Food",
    difficulty: "Intermediate",
    estimatedTime: "1 week (including starter)",
    materials: [
      { name: "All-purpose flour", quantity: "5 pounds", estimatedCost: 4 },
      { name: "Whole wheat flour", quantity: "2 pounds", estimatedCost: 3 },
      { name: "Sea salt", quantity: "1 container", estimatedCost: 3 },
      { name: "Filtered water", quantity: "As needed", estimatedCost: 0 },
    ],
    tools: [
      { name: "Kitchen scale", required: true },
      { name: "Large mixing bowls", required: true },
      { name: "Dutch oven", required: true },
      { name: "Bench scraper", required: false },
    ],
    steps: [
      {
        stepNumber: 1,
        title: "Create sourdough starter",
        description:
          "Mix flour and water, feed daily for 7 days until bubbly and active.",
        tips: ["Keep at room temperature", "Discard half before each feeding"],
      },
      {
        stepNumber: 2,
        title: "Mix the dough",
        description: "Combine starter, flour, water, and salt to form dough.",
      },
      {
        stepNumber: 3,
        title: "Bulk fermentation",
        description: "Let dough rise for 4-6 hours with periodic folds.",
        tips: ["Perform stretch and folds every 30 minutes"],
      },
      {
        stepNumber: 4,
        title: "Shape and final proof",
        description: "Shape loaf and let proof in refrigerator overnight.",
      },
      {
        stepNumber: 5,
        title: "Bake the bread",
        description: "Score and bake in preheated Dutch oven.",
        tips: ["Preheat Dutch oven to 450°F", "Steam creates crispy crust"],
      },
    ],
    images: [
      {
        url: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800",
        caption: "Fresh sourdough bread",
        isMainImage: true,
      },
    ],
    tags: ["sourdough", "bread", "baking", "fermentation"],
  },
];

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("Connected to MongoDB");

    // Find the first user to use as author (you should create a user first)
    const users = await User.find().limit(1);

    if (users.length === 0) {
      console.log("No users found. Please create at least one user first.");
      return;
    }

    const authorId = users[0]._id;

    // Clear existing projects
    await DIYProject.deleteMany({});
    console.log("Cleared existing projects");

    // Add author to each project
    const projectsWithAuthor = seedProjects.map((project) => ({
      ...project,
      author: authorId,
    }));

    // Insert seed projects
    const insertedProjects = await DIYProject.insertMany(projectsWithAuthor);
    console.log(`Inserted ${insertedProjects.length} projects`);

    console.log("Database seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
}

// Run the seed function
seedDatabase();
