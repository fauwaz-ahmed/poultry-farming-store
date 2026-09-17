import "dotenv/config";

async function main() {
  const { connectDB } = await import("../lib/db");
  const { default: Category } = await import("../models/Category");
  const { default: Product } = await import("../models/Product");

  await connectDB();

  console.log("Connected to MongoDB.");

  // Clear development seed data
  await Product.deleteMany({});
  await Category.deleteMany({});

  // Create the four initial categories
  const categories = await Category.insertMany([
    {
      name: "Chickens",
      slug: "chickens",
      description: "Chicks and poultry birds for farming.",
    },
    {
      name: "Poultry Feed",
      slug: "poultry-feed",
      description: "Quality feed products for poultry farming.",
    },
    {
      name: "Poultry Medicines",
      slug: "poultry-medicines",
      description: "Poultry health and farm-care products.",
    },
    {
      name: "Farm Equipment",
      slug: "farm-equipment",
      description: "Equipment and supplies for poultry farms.",
    },
  ]);

  console.log(`Seeded ${categories.length} categories.`);

  const categoryMap = Object.fromEntries(
    categories.map((category) => [category.slug, category._id])
  );

  // Create development products
  const products = [
    {
      name: "Broiler Chicks",
      slug: "broiler-chicks",
      sku: "CHK-BROILER-001",
      unit: "piece",
      category: categoryMap["chickens"],
      price: 45,
      stock: 500,
      description: "Broiler chicks for poultry farming.",
      isActive: true,
    },
    {
      name: "Layer Chicks",
      slug: "layer-chicks",
      sku: "CHK-LAYER-001",
      unit: "piece",
      category: categoryMap["chickens"],
      price: 55,
      stock: 500,
      description: "Layer chicks for poultry farming.",
      isActive: true,
    },
    {
      name: "Broiler Starter Feed",
      slug: "broiler-starter-feed",
      sku: "FEED-BROILER-START-001",
      unit: "bag",
      category: categoryMap["poultry-feed"],
      price: 1450,
      stock: 100,
      description: "Starter feed for broiler farming.",
      isActive: true,
    },
    {
      name: "Layer Feed",
      slug: "layer-feed",
      sku: "FEED-LAYER-001",
      unit: "bag",
      category: categoryMap["poultry-feed"],
      price: 1350,
      stock: 100,
      description: "Feed for layer farming.",
      isActive: true,
    },
    {
      name: "Poultry Vitamin Supplement",
      slug: "poultry-vitamin-supplement",
      sku: "MED-VITAMIN-001",
      unit: "bottle",
      category: categoryMap["poultry-medicines"],
      price: 350,
      stock: 50,
      description: "Poultry farm health supplement.",
      isActive: true,
    },
    {
      name: "Poultry Electrolyte Supplement",
      slug: "poultry-electrolyte-supplement",
      sku: "MED-ELECTROLYTE-001",
      unit: "bottle",
      category: categoryMap["poultry-medicines"],
      price: 280,
      stock: 50,
      description: "Electrolyte product for poultry farm use.",
      isActive: true,
    },
    {
      name: "Poultry Feeder",
      slug: "poultry-feeder",
      sku: "EQUIP-FEEDER-001",
      unit: "piece",
      category: categoryMap["farm-equipment"],
      price: 650,
      stock: 50,
      description: "Feeder equipment for poultry farms.",
      isActive: true,
    },
    {
      name: "Poultry Drinker",
      slug: "poultry-drinker",
      sku: "EQUIP-DRINKER-001",
      unit: "piece",
      category: categoryMap["farm-equipment"],
      price: 550,
      stock: 50,
      description: "Drinking equipment for poultry farms.",
      isActive: true,
    },
  ];

  const createdProducts = await Product.insertMany(products);

  console.log(`Seeded ${createdProducts.length} products.`);
  console.log("Database seeded successfully.");
}

main().catch((error) => {
  console.error("Seed failed:");
  console.error(error);
  process.exit(1);
});