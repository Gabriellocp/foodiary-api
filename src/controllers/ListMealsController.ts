import { and, eq, gte, lte } from "drizzle-orm";
import z from "zod";
import { db } from "../db";
import { mealsTable } from "../db/schema";
import { HttpResponse, ProtectedHttpRequest } from "../types/Http";
import { badRequest, ok } from "../utils/http";

const schema = z.object({
    date: z.iso.date().transform(dateStr => new Date(dateStr))
})
export class ListMealsController {
    static async handle(request: ProtectedHttpRequest): Promise<HttpResponse> {
        const { success, data, error } = schema.safeParse(request.queryParams)
        if (!success) {
            return badRequest({ errors: error.issues })
        }
        const endOfTheDay = new Date(data.date)
        endOfTheDay.setUTCHours(23, 59, 59)
        const meals = await db.query.mealsTable.findMany({
            columns: {
                id: true,
                icon: true,
                name: true,
                foods: true,
                createdAt: true
            },
            where: and(
                gte(mealsTable.createdAt, data.date),
                lte(mealsTable.createdAt, endOfTheDay),
                eq(mealsTable.userId, request.userId),
                eq(mealsTable.status, 'success')
            )
        })
        return ok({ meals })
    }
}