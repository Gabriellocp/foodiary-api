import z from "zod";
import { db } from "../db";
import { mealsTable } from "../db/schema";
import { HttpResponse, ProtectedHttpRequest } from "../types/Http";
import { badRequest, ok } from "../utils/http";

const schema = z.object({
    fileType: z.enum(['audio/m4a', 'image/jpeg'])
})
export class CreateMealController {
    static async handle(request: ProtectedHttpRequest): Promise<HttpResponse> {
        const { success, data, error } = schema.safeParse(request.body)
        if (!success) {
            return badRequest({ errors: error.issues })
        }
        const [meal] = await db.insert(mealsTable)
            .values({
                userId: request.userId,
                inputFileKey: 'input_file_key',
                inputType: data.fileType === 'audio/m4a' ? 'audio' : 'picture',
                status: 'uploading',
                name: '',
                icon: '',
                foods: []
            })
            .returning({
                id: mealsTable.id
            })
        return ok({ meal })
    }
}