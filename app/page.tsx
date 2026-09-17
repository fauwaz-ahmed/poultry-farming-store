import Link from "next/link";
import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import { ProductCard } from "@/components/product/ProductCard";

const cats = [
  [
    "/chickens",
    "🐔",
    "Chickens",
    "Breeds and farm-raised birds",
  ],
  [
    "/poultry-feed",
    "🌾",
    "Poultry Feed",
    "Nutrition for every farming stage",
  ],
  [
    "/poultry-medicines",
    "🧴",
    "Poultry Medicines",
    "Permitted poultry health products",
  ],
  [
    "/farm-equipment",
    "⚙️",
    "Farm Equipment",
    "Practical tools and systems",
  ],
] as const;

export default async function Home() {
  await connectDB();

  const products = await Product.find({
    active: true,
  })
    .sort({ createdAt: -1 })
    .limit(4)
    .lean();

  return (
    <main>
      <section className="bg-farm-700 text-white">
        <div className="container-farm grid min-h-[460px] items-center gap-8 py-16 md:grid-cols-2">
          <div>
            <p className="font-bold uppercase tracking-[.2em] text-farm-100">
              Poultry farming store
            </p>

            <h1 className="mt-4 text-4xl font-black md:text-6xl">
              Everything your poultry farm needs.
            </h1>

            <p className="mt-5 max-w-xl text-lg text-white/80">
              Shop chickens, poultry feed, permitted poultry health products
              and farm equipment from one focused store.
            </p>

            <div className="mt-7 flex gap-3">
              <Link
                href="/chickens"
                className="btn bg-white text-farm-800"
              >
                Shop chickens
              </Link>

              <Link
                href="/poultry-feed"
                className="btn border border-white/30"
              >
                Browse feed
              </Link>
            </div>
          </div>

          <div className="rounded-3xl bg-white/10 p-10 text-center text-9xl">
            🐔🌾⚙️
          </div>
        </div>
      </section>

      <section className="container-farm py-16">
        <h2 className="text-3xl font-black">
          Shop by category
        </h2>

        <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cats.map(([href, icon, title, desc]) => (
            <Link
              key={href}
              href={href}
              className="card p-6 transition hover:-translate-y-1"
            >
              <div className="text-5xl">{icon}</div>

              <h3 className="mt-4 text-xl font-bold">
                {title}
              </h3>

              <p className="mt-2 text-sm text-gray-600">
                {desc}
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section className="container-farm py-10">
        <div>
          <p className="font-bold text-farm-600">
            Featured
          </p>

          <h2 className="text-3xl font-black">
            Farm essentials
          </h2>
        </div>

        {products.length > 0 ? (
          <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard
                key={String(product._id)}
                product={{
                  _id: String(product._id),
                  name: product.name,
                  slug: product.slug,
                  sku: product.sku,
                  price: product.price,
                  unit: product.unit,
                  stock: product.stock,
                  images: product.images ?? [],
                }}
              />
            ))}
          </div>
        ) : (
          <div className="mt-7 rounded-xl border p-10 text-center">
            No products available yet.
          </div>
        )}
      </section>
    </main>
  );
}
