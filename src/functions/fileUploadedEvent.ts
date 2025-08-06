import { SendMessageCommand } from "@aws-sdk/client-sqs";
import { S3Event } from "aws-lambda";
import { sqsClient } from "../clients/sqsClient";

export async function handler(event: S3Event) {
    console.log(process.env.MEALS_QUEUE_URL)
    console.log('ESTOU AQUI PROCESSANDO UM ARQUIVO')
    await Promise.all(event.Records.map(async (record) => {
        const command = new SendMessageCommand({
            QueueUrl: process.env.MEALS_QUEUE_URL,
            MessageBody: JSON.stringify({ fileKey: record.s3.object.key })
        })
        await sqsClient.send(command)
    }))
}