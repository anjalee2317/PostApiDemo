import { DynamoDB } from "@aws-sdk/client-dynamodb";
import { PutCommand } from "@aws-sdk/lib-dynamodb";
import { IPost } from "../../../types";

const dynamodb = new DynamoDB({});

export async function update(postId: string, body: string | null) {
    // If no body, return an error
    if (!body) {
        return {
            statusCode: 400,
            body: JSON.stringify({ message: "Missing body" }),
        };
    }

    // Parse the new object
    const bodyParsed = JSON.parse(body) as IPost;

    try {
        await dynamodb.send(
            new PutCommand({
                TableName: process.env.TABLE_NAME,
                Item: {
                    pk: `POST#${postId}`, // Ensure the primary key remains same
                    ...bodyParsed, // Replace with the new object
                },
            })
        );

        return {
            statusCode: 200,
            body: JSON.stringify({ message: "Post replaced successfully" }),
        };
    } catch (error) {
        console.error("Error replacing post:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Error replacing post" }),
        };
    }
}