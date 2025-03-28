import { DynamoDB } from '@aws-sdk/client-dynamodb';
import { PutCommand } from '@aws-sdk/lib-dynamodb';
import {randomUUID} from "node:crypto";
import {IPost} from "../../../types";

const dynamodb = new DynamoDB({});

export async function create(body: string | null) {
    const uuid = randomUUID();

    // If no body, return an error
    if (!body) {
        return {
            statusCode: 400,
            body: JSON.stringify({ message: 'Missing body' }),
        };
    }

    // Parse the body
    const bodyParsed = JSON.parse(body) as IPost;

    // Create the post
    await dynamodb.send(
        new PutCommand({
            TableName: process.env.TABLE_NAME,
            Item: {
                pk: `POST#${uuid}`,
                ...bodyParsed,
            },
        })
    );

    return {
        statusCode: 200,
        body: JSON.stringify({ message: 'Post created successfully' }),
    };
}