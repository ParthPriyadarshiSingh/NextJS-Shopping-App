import Card from "@/components/card";
import { createClient } from "@/supabase/client";
import { getImageUrl } from "@/utils";
import { notFound } from "next/navigation";

export const revalidate = 3600;

export default async function Home() {
  const supabase = createClient();

  const { data: topProducts, error: topProductsError } = await supabase
    .from("shopping-products")
    .select()
    .eq("boost", true);

  const { data: products, error } = await supabase
    .from("shopping-products")
    .select();

  if (!products) {
    return notFound();
  }

  return (
    <main className="min-h-screen mx-auto max-w-[100rem]">
      <div className="px-12 pt-12 pb-12">
        <div className="flex flex-col xl:flex-row gap-2 xl:gap-40">
          <div className="pt-12">
            <h2 className="text-4xl mb-16">OUR TOP PRODUCTS</h2>
            <p className="text-xl">You can pay to boost your products here.</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-2 xl:gap-12">
            {topProducts ? (
              topProducts.map((product) => (
                <Card
                  key={product.id}
                  {...product}
                  imageUrl={getImageUrl(product.imageUrl)}
                />
              ))
            ) : (
              <p className="text-xl font-semibold text-yellow-500 mt-2">
                No top products for now. Check out all the products below!
              </p>
            )}
          </div>
        </div>
        <h2 className="text-4xl mt-20 mb-16">ALL PRODUCTS</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {products.map((product) => (
            <Card
              key={product.id}
              {...product}
              imageUrl={getImageUrl(product.imageUrl)}
            />
          ))}
        </div>
      </div>
    </main>
  );
}
