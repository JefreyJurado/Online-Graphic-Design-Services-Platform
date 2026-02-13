const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Service = require('./models/Service');

// Load env vars
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => {
    console.error('❌ MongoDB Connection Error:', err);
    process.exit(1);
  });

// Sample services data
const sampleServices = [
  {
    name: "Professional Logo Design",
    description: "Get a custom, professional logo that represents your brand perfectly. Includes 3 initial concepts, unlimited revisions, and final files in all formats (PNG, JPG, SVG, AI). Perfect for startups and businesses looking to establish their brand identity.",
    category: "Logo Design",
    price: 3500,
    duration: "5-7 days",
    features: [
      "3 initial logo concepts",
      "Unlimited revisions",
      "Final files in PNG, JPG, SVG, AI",
      "Color and black & white versions",
      "Brand style guide included",
      "Commercial usage rights"
    ],
    createdBy: null,
    isActive: true
  },
  {
    name: "Complete Brand Identity Package",
    description: "Comprehensive branding solution including logo, business cards, letterhead, email signature, and brand guidelines. Perfect for businesses wanting a cohesive professional image across all touchpoints.",
    category: "Branding",
    price: 12000,
    duration: "2-3 weeks",
    features: [
      "Custom logo design",
      "Business card design",
      "Letterhead design",
      "Email signature template",
      "Brand style guide (colors, fonts, usage)",
      "Social media profile graphics",
      "All source files included"
    ],
    createdBy: null,
    isActive: true
  },
  {
    name: "Social Media Graphics Pack",
    description: "Monthly package of custom social media graphics optimized for Facebook, Instagram, and Twitter. Includes posts, stories, and cover images designed to boost your social media presence.",
    category: "Social Media",
    price: 5000,
    duration: "Weekly delivery",
    features: [
      "15 custom post designs per month",
      "5 Instagram story templates",
      "Facebook and Twitter cover photos",
      "Editable templates included",
      "Optimized for each platform",
      "Unlimited revisions"
    ],
    createdBy: null,
    isActive: true
  },
  {
    name: "Product Packaging Design",
    description: "Eye-catching packaging design that makes your product stand out on shelves. Includes 3D mockups and print-ready files. Perfect for food products, cosmetics, electronics, and retail items.",
    category: "Packaging",
    price: 8500,
    duration: "1-2 weeks",
    features: [
      "Custom packaging design",
      "3D product mockups",
      "Print-ready files (with bleed)",
      "Dieline template",
      "2 revision rounds",
      "Label design included"
    ],
    createdBy: null,
    isActive: true
  },
  {
    name: "Flyer & Poster Design",
    description: "Professional flyer and poster designs for events, promotions, and marketing campaigns. Perfect for both print and digital distribution. Get attention-grabbing designs that convert.",
    category: "Print Design",
    price: 2500,
    duration: "3-5 days",
    features: [
      "Custom design concept",
      "Print-ready PDF (300 DPI)",
      "Digital version for social media",
      "2 revision rounds",
      "A4 or custom size",
      "Source files included"
    ],
    createdBy: null,
    isActive: true
  },
  {
    name: "Website UI/UX Design",
    description: "Modern, responsive website design focused on user experience. Includes homepage, inner pages, mobile design, and design system. Perfect for businesses launching or redesigning their website.",
    category: "Web Design",
    price: 15000,
    duration: "3-4 weeks",
    features: [
      "Homepage design",
      "5 inner page designs",
      "Mobile responsive design",
      "Design system (colors, typography)",
      "Clickable prototype",
      "Developer-ready assets",
      "Unlimited revisions"
    ],
    createdBy: null,
    isActive: true
  },
  {
    name: "Business Card Design",
    description: "Professional business card design that leaves a lasting impression. Includes front and back design with multiple concepts. Print-ready files delivered in all formats.",
    category: "Branding",
    price: 1500,
    duration: "2-3 days",
    features: [
      "Front and back design",
      "3 initial concepts",
      "Print-ready PDF (CMYK)",
      "2 revision rounds",
      "Standard or custom size",
      "Source files (AI, PSD)"
    ],
    createdBy: null,
    isActive: true
  },
  {
    name: "Instagram Feed Design",
    description: "Cohesive Instagram grid design that tells your brand story. Includes 9 posts designed to work together as a unified feed. Perfect for influencers and businesses building their Instagram presence.",
    category: "Social Media",
    price: 3500,
    duration: "1 week",
    features: [
      "9 coordinated post designs",
      "Grid preview mockup",
      "Editable Canva templates",
      "Color palette guide",
      "Typography recommendations",
      "Instagram story templates bonus"
    ],
    createdBy: null,
    isActive: true
  },
  {
    name: "Menu Design (Restaurant/Cafe)",
    description: "Beautiful menu design for restaurants, cafes, and food businesses. Includes dine-in menu, takeout menu, and digital version. Makes your offerings look as good as they taste!",
    category: "Print Design",
    price: 4500,
    duration: "5-7 days",
    features: [
      "Dine-in menu design",
      "Takeout menu version",
      "Digital menu (PDF/image)",
      "Print-ready files",
      "QR code menu option",
      "2 revision rounds"
    ],
    createdBy: null,
    isActive: true
  }
];

// Seed function
async function seedServices() {
  try {
    
    const User = require('./models/User');
    const user = await User.findOne({ email: 'jeffrey@test.com' });
    
    if (!user) {
      console.log('❌ User not found. Please make sure jeffrey@test.com exists in the database.');
      process.exit(1);
    }
    
    console.log('✅ Found user:', user.email);
    
    // Set createdBy for all services
    sampleServices.forEach(service => {
      service.createdBy = user._id;
    });
    
    // Delete existing services
    await Service.deleteMany({});
    console.log('🗑️  Cleared existing services');
    
    // Insert sample services
    const services = await Service.insertMany(sampleServices);
    console.log(`✅ Added ${services.length} sample services!`);
    
    console.log('\n📋 Sample Services:');
    services.forEach(service => {
      console.log(`   - ${service.name} (${service.category}) - ₱${service.price}`);
    });
    
    console.log('\n🎉 Database seeded successfully!');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
}

// Run seed
seedServices();