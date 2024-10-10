"use server";

import { z } from "zod";
import { createServerActionClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const MAX_FILE_SIZE = 5000000;
const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

export async function sellYourItemAction(prevState: any, formData: FormData) {
  const schema = z.object({
    name: z.string().min(6),
    description: z.string().min(10),
    contactEmail: z.string().min(1).email("This is not a valid email address"),
    price: z.string().min(1),
    imageUrl: z
      .any()
      .refine((file) => file?.size <= MAX_FILE_SIZE, `Max image size is 5MB.`)
      .refine(
        (file) => ACCEPTED_IMAGE_TYPES.includes(file?.type),
        "Only .jpg, .jpeg, .png and .webp formats are supported."
      ),
  });

  const validatedFields = schema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    contactEmail: formData.get("contactEmail"),
    price: formData.get("price"),
    imageUrl: formData.get("imageUrl"),
  });

  if (!validatedFields.success) {
    // handle error then return
    return {
      type: "error",
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Missing fields. Failed to create Product",
    };
  }

  const { name, imageUrl, contactEmail, description, price } =
    validatedFields.data;

  try {
    const fileName = `${Math.random()}-${imageUrl.name}`;
    const supabase = createServerActionClient({ cookies });

    const { data, error } = await supabase.storage
      .from("storage")
      .upload(fileName, imageUrl, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      return {
        type: "error",
        message: "Database Error: Failed to upload image.",
      };
    }

    if (data) {
      const path = data.path;

      const { error: productsError } = await supabase
        .from("shopping-products")
        .insert({ name, imageUrl: path, contactEmail, description, price });

      if (productsError) {
        return {
          type: "error",
          message: "Database Error: Failed to upload Product.",
        };
      }
    }
  } catch (error) {
    console.error("Error", error);
    return {
      type: "error",
      message: "Database Error: Failed to create Product.",
    };
  }

  revalidatePath("/");
  redirect("/");
}
