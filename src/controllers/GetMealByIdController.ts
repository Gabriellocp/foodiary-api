import { and, eq } from "drizzle-orm";
import z from "zod";
import { db } from "../db";
import { mealsTable } from "../db/schema";
import { HttpResponse, ProtectedHttpRequest } from "../types/Http";
import { badRequest, ok } from "../utils/http";

const schema = z.object({
    mealId: z.uuid()
})
export class GetMealByIdController {
    static async handle(request: ProtectedHttpRequest): Promise<HttpResponse> {
        const { success, data, error } = schema.safeParse(request.params)
        if (!success) {
            return badRequest({ errors: error.issues })
        }
        const meal = await db.query.mealsTable.findFirst({
            columns: {
                id: true,
                icon: true,
                name: true,
                foods: true,
                createdAt: true,
                status: true
            },
            where: and(
                eq(mealsTable.userId, request.userId),
                eq(mealsTable.id, data.mealId),

            )
        })
        return ok({ meal })
    }
}