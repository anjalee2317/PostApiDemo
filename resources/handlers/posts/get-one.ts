import { DynamoDB } from '@aws-sdk/client-dynamodb';
import { GetCommand } from '@aws-sdk/lib-dynamodb';

const dynamodb = new DynamoDB({});

export async function getOne({ id }: { id: string}) {

    const result = await dynamodb.send(
        new GetCommand({
            TableName: process.env.TABLE_NAME,
            Key: {
                pk: `POST#${id}`
            },
        })
    );

    // If post is not found, return 404
    if (!result.Item) {
        return {
            statusCode: 404,
            body: JSON.stringify({ message: 'Post not found' }),
        };
    }

    // If found, return the post
    return {
        statusCode: 200,
        body: JSON.stringify(result.Item),
    };
}