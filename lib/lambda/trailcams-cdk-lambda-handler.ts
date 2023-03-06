import { CfnOutput, Stack } from "aws-cdk-lib";
import { FunctionUrlAuthType, Runtime } from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import path = require("path");

export class TrailcamsCdkLambdaHandler {
  private handler: NodejsFunction;

  constructor(stack: Stack, props: LambdaProps) {
    const handler = new NodejsFunction(stack, props.handlerName, {
      runtime: Runtime.NODEJS_18_X,
      entry: path.join(__dirname, props.handlerPath),
      handler: "handler",
      /*bundling: {
        nodeModules: props.nodeModules,
      },*/
    });

    const myFunctionUrl = handler.addFunctionUrl({
      authType: FunctionUrlAuthType.AWS_IAM,
      cors: {
        allowedOrigins: ["*"],
      },
    });

    const cfnOutput = new CfnOutput(stack, `${props.handlerName}URL`, {
      value: myFunctionUrl.url,
    });

    this.handler = handler;
  }

  public getHandler(): NodejsFunction {
    return this.handler;
  }
}

export interface LambdaProps {
  readonly handlerName: string;
  readonly handlerPath: string;
  readonly nodeModules?: string[];
}
