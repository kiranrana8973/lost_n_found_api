const mongoose = require("mongoose");
const colors = require("colors");
const dotenv = require("dotenv");
const Batch = require("./models/batch_model");
const Student = require("./models/student_model");
const Item = require("./models/items_model");
const Comment = require("./models/comment_model");

// Load env vars
dotenv.config({ path: "./config/config.env" });

// Connect to database
const connectDB = async () => {
  const conn = await mongoose.connect(process.env.LOCAL_DATABASE_URI);
  console.log(`MongoDB Connected: ${conn.connection.host}`.cyan.underline.bold);
};

// Dummy data
const batches = [
  { batchName: "2024-CS-A", status: "active" },
  { batchName: "2024-CS-B", status: "active" },
  { batchName: "2024-IT-A", status: "active" },
  { batchName: "2023-CS-A", status: "active" },
  { batchName: "2023-IT-A", status: "active" },
];

const students = [
  {
    name: "Sarah Johnson",
    email: "sarah.johnson@college.edu",
    username: "sarahj",
    password: "password123",
    phoneNumber: "+1-555-0101",
    profilePicture: "default-profile.png",
  },
  {
    name: "Michael Chen",
    email: "michael.chen@college.edu",
    username: "mikechen",
    password: "password123",
    phoneNumber: "+1-555-0102",
    profilePicture: "default-profile.png",
  },
  {
    name: "Emily Rodriguez",
    email: "emily.rodriguez@college.edu",
    username: "emilyrod",
    password: "password123",
    phoneNumber: "+1-555-0103",
    profilePicture: "default-profile.png",
  },
  {
    name: "James Wilson",
    email: "james.wilson@college.edu",
    username: "jameswilson",
    password: "password123",
    phoneNumber: "+1-555-0104",
    profilePicture: "default-profile.png",
  },
  {
    name: "Priya Patel",
    email: "priya.patel@college.edu",
    username: "priyap",
    password: "password123",
    phoneNumber: "+1-555-0105",
    profilePicture: "default-profile.png",
  },
  {
    name: "David Kim",
    email: "david.kim@college.edu",
    username: "davidkim",
    password: "password123",
    phoneNumber: "+1-555-0106",
    profilePicture: "default-profile.png",
  },
  {
    name: "Olivia Martinez",
    email: "olivia.martinez@college.edu",
    username: "oliviam",
    password: "password123",
    phoneNumber: "+1-555-0107",
    profilePicture: "default-profile.png",
  },
  {
    name: "Ryan Thompson",
    email: "ryan.thompson@college.edu",
    username: "ryant",
    password: "password123",
    phoneNumber: "+1-555-0108",
    profilePicture: "default-profile.png",
  },
  {
    name: "Sophia Lee",
    email: "sophia.lee@college.edu",
    username: "sophialee",
    password: "password123",
    phoneNumber: "+1-555-0109",
    profilePicture: "default-profile.png",
  },
  {
    name: "Alex Garcia",
    email: "alex.garcia@college.edu",
    username: "alexg",
    password: "password123",
    phoneNumber: "+1-555-0110",
    profilePicture: "default-profile.png",
  },
  {
    name: "Emma Brown",
    email: "emma.brown@college.edu",
    username: "emmab",
    password: "password123",
    phoneNumber: "+1-555-0111",
    profilePicture: "default-profile.png",
  },
  {
    name: "Daniel Singh",
    email: "daniel.singh@college.edu",
    username: "daniels",
    password: "password123",
    phoneNumber: "+1-555-0112",
    profilePicture: "default-profile.png",
  },
];

const items = [
  {
    itemName: "Black North Face Backpack",
    description: "Lost black North Face backpack near the library. Contains laptop, charger, and textbooks. Has a small Spiderman keychain attached.",
    type: "lost",
    mediaUrl: "default.jpg",
    status: "available",
  },
  {
    itemName: "iPhone 13 Pro in Blue Case",
    description: "Found an iPhone 13 Pro in a blue silicone case near the cafeteria on the second floor. Lock screen has a photo of a golden retriever.",
    type: "found",
    mediaUrl: "default.jpg",
    status: "available",
  },
  {
    itemName: "Silver Water Bottle - Hydro Flask",
    description: "Lost my silver Hydro Flask water bottle in the gym yesterday afternoon. Has stickers from national parks on it.",
    type: "lost",
    mediaUrl: "default.jpg",
    status: "available",
  },
  {
    itemName: "Blue Calculator (TI-84 Plus)",
    description: "Found a blue TI-84 Plus calculator in Math Building room 205. Has initials 'RW' written on the back.",
    type: "found",
    mediaUrl: "default.jpg",
    status: "available",
  },
  {
    itemName: "Brown Leather Wallet",
    description: "Lost brown leather wallet near the parking lot entrance. Contains student ID and some cash. Urgent!",
    type: "lost",
    mediaUrl: "default.jpg",
    status: "available",
  },
  {
    itemName: "Wireless Earbuds (AirPods Pro)",
    description: "Found white AirPods Pro in charging case on bench near the quad. Serial number visible inside case.",
    type: "found",
    mediaUrl: "default.jpg",
    status: "claimed",
  },
  {
    itemName: "Red Hoodie - Nike Brand",
    description: "Lost my red Nike hoodie (size M) in the computer lab. Has my name tag inside.",
    type: "lost",
    mediaUrl: "default.jpg",
    status: "available",
  },
  {
    itemName: "Set of Keys with Green Lanyard",
    description: "Found a set of keys (3 keys + car remote) with a green university lanyard attached. Found near Building C.",
    type: "found",
    mediaUrl: "default.jpg",
    status: "available",
  },
  {
    itemName: "Prescription Glasses in Black Case",
    description: "Lost my prescription glasses in a black hard case. Left them in the auditorium after lecture.",
    type: "lost",
    mediaUrl: "default.jpg",
    status: "available",
  },
  {
    itemName: "Textbook: Data Structures & Algorithms",
    description: "Found 'Introduction to Data Structures and Algorithms' textbook in the library study area. Has highlighting and notes inside.",
    type: "found",
    mediaUrl: "default.jpg",
    status: "available",
  },
  {
    itemName: "Purple Umbrella",
    description: "Lost my purple umbrella with floral pattern near the main entrance yesterday during the rain.",
    type: "lost",
    mediaUrl: "default.jpg",
    status: "available",
  },
  {
    itemName: "Sports Watch - Fitbit Charge 5",
    description: "Found a black Fitbit Charge 5 in the locker room. Still has some battery left.",
    type: "found",
    mediaUrl: "default.jpg",
    status: "available",
  },
  {
    itemName: "White Lab Coat",
    description: "Lost white lab coat (size L) in Chemistry Building. Has my name embroidered: 'J. Wilson'",
    type: "lost",
    mediaUrl: "default.jpg",
    status: "resolved",
  },
  {
    itemName: "USB Flash Drive - 64GB SanDisk",
    description: "Found a 64GB SanDisk USB drive near the computer center. Contains important looking files.",
    type: "found",
    mediaUrl: "default.jpg",
    status: "available",
  },
  {
    itemName: "Skateboard - Element Brand",
    description: "Lost my Element skateboard near the student center. Has custom grip tape with geometric design.",
    type: "lost",
    mediaUrl: "default.jpg",
    status: "available",
  },
];

const comments = [
  {
    text: "I think I saw this backpack near the library yesterday! Have you checked the lost and found office?",
  },
  {
    text: "Hey @sarahj, I found it! Come to the library front desk.",
  },
  {
    text: "Is this the blue case with sparkles or plain blue?",
  },
  {
    text: "I lost a similar water bottle too! Hope you find yours.",
  },
  {
    text: "The calculator might be mine! I'll come by to check the serial number.",
  },
  {
    text: "Thanks for posting! I'll spread the word about the wallet.",
  },
  {
    text: "These might be mine! What's the serial number?",
  },
  {
    text: "Still available?",
  },
  {
    text: "I saw someone with this hoodie near the gym this morning!",
  },
  {
    text: "Are the keys still unclaimed? I think they might belong to my roommate.",
  },
];

// Import data
const importData = async () => {
  try {
    await connectDB();

    // Clear existing data
    await Batch.deleteMany();
    await Student.deleteMany();
    await Item.deleteMany();
    await Comment.deleteMany();
    console.log("Data Destroyed...".red.inverse);

    // Create batches
    const createdBatches = await Batch.insertMany(batches);
    console.log(`${createdBatches.length} Batches created`.green.inverse);

    // Assign batches to students and create them one by one to trigger password hashing
    const createdStudents = [];
    for (let i = 0; i < students.length; i++) {
      const studentData = {
        ...students[i],
        batchId: createdBatches[i % createdBatches.length]._id,
      };
      const student = await Student.create(studentData);
      createdStudents.push(student);
    }
    console.log(`${createdStudents.length} Students created`.green.inverse);

    // Assign students to items
    const itemsWithStudents = items.map((item, index) => {
      const reportedBy = createdStudents[index % createdStudents.length]._id;
      const itemData = {
        ...item,
        reportedBy,
      };

      // Add claimedBy for claimed items
      if (item.status === "claimed" || item.status === "resolved") {
        itemData.claimedBy =
          createdStudents[(index + 1) % createdStudents.length]._id;
        itemData.isClaimed = true;
      }

      return itemData;
    });

    // Create items
    const createdItems = await Item.insertMany(itemsWithStudents);
    console.log(`${createdItems.length} Items created`.green.inverse);

    // Create comments
    const commentsWithRefs = comments.map((comment, index) => ({
      ...comment,
      item: createdItems[index % createdItems.length]._id,
      commentedBy: createdStudents[(index + 2) % createdStudents.length]._id,
    }));

    const createdComments = await Comment.insertMany(commentsWithRefs);
    console.log(`${createdComments.length} Comments created`.green.inverse);

    console.log("\n✅ All data imported successfully!".green.bold);
    console.log("\n📊 Summary:".cyan.bold);
    console.log(`   Batches: ${createdBatches.length}`);
    console.log(`   Students: ${createdStudents.length}`);
    console.log(`   Items: ${createdItems.length}`);
    console.log(`   Comments: ${createdComments.length}`);

    console.log("\n🔑 Login Credentials (All passwords: password123):".yellow.bold);
    createdStudents.slice(0, 5).forEach((student) => {
      console.log(`   Email: ${student.email} | Username: ${student.username}`);
    });

    process.exit();
  } catch (error) {
    console.error(`Error: ${error}`.red.inverse);
    process.exit(1);
  }
};

// Delete data
const deleteData = async () => {
  try {
    await connectDB();

    await Batch.deleteMany();
    await Student.deleteMany();
    await Item.deleteMany();
    await Comment.deleteMany();

    console.log("Data Destroyed...".red.inverse);
    process.exit();
  } catch (error) {
    console.error(`Error: ${error}`.red.inverse);
    process.exit(1);
  }
};

// Run functions based on command line argument
if (process.argv[2] === "-i") {
  importData();
} else if (process.argv[2] === "-d") {
  deleteData();
} else {
  console.log("Please use -i to import or -d to delete data".yellow);
  process.exit();
}
