"use server";

import { revalidatePath } from "next/cache";
import { deleteConnection } from "@/lib/qbo/connection-store";

export async function disconnectQbo(): Promise<{ error?: string; success?: boolean }> {
  try {
    await deleteConnection();
    revalidatePath("/admin/settings/integrations");
    revalidatePath("/admin/settings");
    return { success: true };
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "Could not disconnect QuickBooks.",
    };
  }
}
