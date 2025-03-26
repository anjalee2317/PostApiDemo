import { APIGatewayProxyEvent } from 'aws-lambda';
import { getOne } from '../handlers/posts/get-one';
import { deletePost } from  '../handlers/posts/delete';
import { update } from "../handlers/posts/update";
import { partialUpdate } from "../handlers/posts/partial-update";

export const handler = async (event: APIGatewayProxyEvent) => {
    const  id = event.pathParameters?.id;

    if (!id) {
        return {
          statusCode: 400,
          body: JSON.stringify({ message: 'Missing path parameter: id' }),
        };
    }

    try {
        // Handle different HTTP methods
        switch (event.httpMethod) {
            case 'GET':
                return await getOne({ id });
            case 'DELETE':
                return await deletePost({ id });
            case "PUT":
                return await update(id, event.body);
            case "PATCH":
                return await partialUpdate(id, event.body);
            default:
                return {
                  statusCode: 400,
                  body: JSON.stringify({ message: 'Invalid HTTP method' }),
                };
        }
    } catch (error) {
        console.log(error);

        return {
            statusCode: 500,
            body: JSON.stringify({ message: error }),
        };
    }
}