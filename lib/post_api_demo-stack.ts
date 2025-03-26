// import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as cdk from 'aws-cdk-lib';
import {CfnOutput, RemovalPolicy} from 'aws-cdk-lib';
import {Construct} from 'constructs';
import {AttributeType, BillingMode, Table} from "aws-cdk-lib/aws-dynamodb";
import {ApiKey, ApiKeySourceType, Cors, LambdaIntegration, RestApi, UsagePlan} from "aws-cdk-lib/aws-apigateway";
import {NodejsFunction} from "aws-cdk-lib/aws-lambda-nodejs";

export class PostApiDemoStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create DynamoDB table
    const dbTable = new Table(this, 'DbTable', {
      partitionKey: { name: 'pk', type: AttributeType.STRING },
      removalPolicy: RemovalPolicy.DESTROY,
      billingMode: BillingMode.PAY_PER_REQUEST,
    });

    const api = new RestApi(this, 'RestAPI', {
      restApiName: 'RestAPI',
      defaultCorsPreflightOptions: {
        allowOrigins: Cors.ALL_ORIGINS,
        allowMethods: Cors.ALL_METHODS,
      },
      apiKeySourceType: ApiKeySourceType.HEADER,
    });

    const apiKey = new ApiKey(this, 'ApiKey');

    const usagePlan = new UsagePlan(this, 'UsagePlan', {
      name: 'Usage Plan',
      apiStages: [
        {
          api,
          stage: api.deploymentStage,
        },
      ],
    });

    usagePlan.addApiKey(apiKey);

    const  postsLambda = new NodejsFunction(this, 'PostsLambda', {
      entry: 'resources/endpoints/posts.ts',
      handler: 'handler',
      environment: {
        TABLE_NAME: dbTable.tableName,
      },
    });

    const  postLambda = new NodejsFunction(this, 'PostLambda', {
      entry: 'resources/endpoints/post.ts',
      handler: 'handler',
      environment: {
        TABLE_NAME: dbTable.tableName,
      },
    });

    dbTable.grantReadWriteData(postsLambda);
    dbTable.grantReadWriteData(postLambda);

    const posts = api.root.addResource('posts');
    const post = posts.addResource('{id}');

    const postsIntegration = new LambdaIntegration(postsLambda);
    const postIntegration = new LambdaIntegration(postLambda);

    posts.addMethod('GET', postsIntegration, {
      apiKeyRequired: true,
    });
    posts.addMethod('POST', postsIntegration, {
      apiKeyRequired: true,
    });
    post.addMethod('GET', postIntegration, {
      apiKeyRequired: true,
    });
    post.addMethod('DELETE', postIntegration, {
      apiKeyRequired: true,
    });
    post.addMethod('PUT', postIntegration, {
      apiKeyRequired: true,
    });

    new CfnOutput(this, 'API Key ID', {
      value: apiKey.keyId,
    });

  }
}
