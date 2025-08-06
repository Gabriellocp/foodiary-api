import { eq } from "drizzle-orm";
import { db } from "../db";
import { mealsTable } from "../db/schema";

export class ProcessMeal {
    static async process({ fileKey }: { fileKey: string }) {
        const meal = await db.query.mealsTable.findFirst({
            where: eq(mealsTable.inputFileKey, fileKey)
        })
        if (!meal) {
            throw new Error('Meal not found')
        }
        if (meal.status === 'failed' || meal.status === 'success') {
            // For any reason it shouldn't be here
            return;
        }
        await db
            .update(mealsTable)
            .set({ status: 'processing' })
            .where(eq(mealsTable.id, meal.id))

        try {
            // CALL IA API

            await db
                .update(mealsTable)
                .set({
                    status: 'success',
                    name: 'Café da manhã',
                    icon: '👨‍🍳',
                    foods: [
                        { name: 'Pão', quantity: 1, calories: 100, proteins: 100, carbohydrates: 100, fats: 100 }
                    ]
                })
                .where(eq(mealsTable.id, meal.id))
        } catch {
            await db
                .update(mealsTable)
                .set({
                    status: 'failed',
                })
                .where(eq(mealsTable.id, meal.id))
        }
    }
}