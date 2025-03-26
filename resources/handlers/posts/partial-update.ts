import { DynamoDB } from "@aws-sdk/client-dynamodb";
import { GetCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { IPost } from "../../../types";

const dynamodb = new DynamoDB({});

export async function partialUpdate(postId: string, body: string | null) {
    if (!body) {
        return {
            statusCode: 400,
            body: JSON.stringify({ message: "Missing body" }),
        };
    }

    const bodyParsed = JSON.parse(body) as Partial<IPost>;

    if (!Object.keys(bodyParsed).length) {
        return {
            statusCode: 400,
            body: JSON.stringify({ message: "No update fields provided" }),
        };
    }

    try {
        // Get the existing post
        const existingPost = await dynamodb.send(
            new GetCommand({
                TableName: process.env.TABLE_NAME,
                Key: {
                    pk: `POST#${postId}`
                },
            })
        );

        if (!existingPost.Item) {
            return {
                statusCode: 404,
                body: JSON.stringify({ message: "Post not found" }),
            };
        }

        // Update the item in DynamoDB
        await dynamodb.send(
            new UpdateCommand({
                TableName: process.env.TABLE_NAME,
                Key: {
                    pk: `POST#${postId}`
                },
                UpdateExpression: "SET " +
                    Object.keys(bodyParsed)
                        .map((key) => `${key} = :${key}`)
                        .join(", "),
                ExpressionAttributeValues: Object.fromEntries(
                    Object.entries(bodyParsed)
                        .map(([key, value]) => [`:${key}`, value])
                ),
                ReturnValues: "ALL_NEW",
            })
        );

        return {
            statusCode: 200,
            body: JSON.stringify({ message: "Post updated successfully" }),
        };
    } catch (error) {
        console.error("Error updating post:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Error updating post" }),
        };
    }
}