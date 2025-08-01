import { hash } from 'bcryptjs';
import { eq } from 'drizzle-orm';
import z from 'zod';
import { db } from '../db';
import { usersTable } from '../db/schema';
import { calculateGoals } from '../lib/calculateGoals';
import { generateAccessToken } from '../lib/jwt';
import { HttpRequest, HttpResponse } from "../types/Http";
import { badRequest, conflict, created } from "../utils/http";
const schema = z.object({
    goal: z.enum(['lose', 'maintain', 'gain']),
    gender: z.enum(['male', 'female']),
    birthDate: z.iso.date(),
    height: z.number(),
    weight: z.number(),
    activityLevel: z.number().min(1).max(5),
    account: z.object({
        name: z.string().min(1),
        email: z.email(),
        password: z.string().min(8)
    })
})
export class SignUpController {
    static async handle(request: HttpRequest): Promise<HttpResponse> {
        const { success, error, data } = schema.safeParse(request.body)
        if (!success) {
            return badRequest({ errors: error?.issues })
        }
        const userAlreadyExists = await db.query.usersTable.findFirst({
            columns: {
                email: true
            },
            where: eq(usersTable.email, data.account.email)
        })
        if (userAlreadyExists) {
            return conflict({ error: 'This email is already in use' })
        }
        // Create user account if email is not in use
        const { account, ...rest } = data
        const hashedPassword = await hash(account.password, 8)
        const goals = calculateGoals({
            activityLevel: rest.activityLevel,
            birthDate: new Date(rest.birthDate),
            gender: rest.gender,
            goal: rest.goal,
            height: rest.height,
            weight: rest.weight
        })
        const [createdUser] = await db.insert(usersTable).values({
            ...account,
            ...rest,
            password: hashedPassword,
            ...goals
        })
            .returning({
                id: usersTable.id
            })
        const accessToken = generateAccessToken(createdUser.id)

        return created({ accessToken })
    }

}