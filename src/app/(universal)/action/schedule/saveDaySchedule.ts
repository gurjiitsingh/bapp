"use server";

import { adminDb } from "@/lib/firebaseAdmin";
import { dayScheduleSchema } from "@/lib/types/daySchedule";
import { revalidatePath } from "next/cache";

export async function saveDaySchedule(formData: FormData) {
   try {
    const schedule: any[] = [];

    // Collect all keys from FormData
    for (const [key, value] of formData.entries()) {
      // key example: schedule[0][day]
      const match = key.match(/schedule\[(\d+)\]\[(\w+)\]/);

      if (!match) continue;

      const index = Number(match[1]);
      const field = match[2];

      if (!schedule[index]) schedule[index] = {};

      // Convert booleans properly
      if (value === "true") schedule[index][field] = true;
      else if (value === "false") schedule[index][field] = false;
      else schedule[index][field] = value;
    }

    console.log("✅ Parsed Schedule:", schedule);

    // OPTIONAL: validate here
    // schedule.forEach(day => { ... })

    // Save each day as document
    for (const day of schedule) {
      await adminDb
        .collection("day_schedule")
        .doc(day.day) // monday, tuesday, etc
        .set(
          {
            ...day,
            updatedAt: new Date(),
          },
          { merge: true }
        );
    }

    revalidatePath("/admin/settings/schedule");

    return { success: true };
  } catch (error) {
    console.error("❌ Failed to save schedule:", error);
    return { success: false, error: "Failed to save schedule" };
  }
}



export async function getSchedule() {
  const snapshot = await adminDb.collection("day_schedule").get();

  return snapshot.docs.map((doc) => {
    const data = doc.data();

    return {
      day: doc.id,
      ...data,
      updatedAt: data.updatedAt?.toDate().toISOString() ?? null,
    };
  });
}




function serializeDoc(doc: any) {
  const data = doc.data();

  return {
    ...data,
    updatedAt: data.updatedAt?.toDate().toISOString() ?? null,
  };
}