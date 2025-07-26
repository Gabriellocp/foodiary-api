import { HttpResponse } from "../types/Http";

export function parseResponse(httpResponse: HttpResponse) {
    return {
        statusCode: httpResponse.statusCode,
        body: httpResponse.body ? JSON.stringify(httpResponse.body) : undefined
    }
}