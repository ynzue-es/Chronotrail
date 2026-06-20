import type { SupabaseClient } from "@supabase/supabase-js"
import { NutritionProduct } from "@/types/course"

/** Catalogue visible : produits globaux + produits perso de l'utilisateur. */
export async function listProducts(
  supabase: SupabaseClient,
): Promise<NutritionProduct[]> {
  const { data, error } = await supabase
    .from("nutrition_products")
    .select("*")
    .order("kind", { ascending: true })
    .order("carbs_g", { ascending: false })
  if (error) throw new Error(`Lecture du catalogue échouée : ${error.message}`)
  return (data ?? []) as NutritionProduct[]
}

/** Ids des produits favoris de l'utilisateur. */
export async function listFavoriteProductIds(
  supabase: SupabaseClient,
): Promise<string[]> {
  const { data, error } = await supabase
    .from("favorite_products")
    .select("product_id")
  if (error) throw new Error(`Lecture des favoris échouée : ${error.message}`)
  return (data ?? []).map((r) => r.product_id as string)
}

export async function setFavoriteProduct(
  supabase: SupabaseClient,
  userId: string,
  productId: string,
  favorite: boolean,
): Promise<void> {
  if (favorite) {
    const { error } = await supabase
      .from("favorite_products")
      .upsert({ user_id: userId, product_id: productId })
    if (error) throw new Error(error.message)
  } else {
    const { error } = await supabase
      .from("favorite_products")
      .delete()
      .eq("user_id", userId)
      .eq("product_id", productId)
    if (error) throw new Error(error.message)
  }
}
