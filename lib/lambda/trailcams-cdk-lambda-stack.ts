import { Stack } from "aws-cdk-lib";
import { Effect, PolicyStatement, ServicePrincipal } from "aws-cdk-lib/aws-iam";
import { Constants } from "../constants";
import { TrailcamsCdkLambdaHandler } from "./trailcams-cdk-lambda-handler";

export class TrailcamsCdkLambdaStack {
  private readonly emailAttachmentHandler: TrailcamsCdkLambdaHandler;
  private readonly emailGuardHandler: TrailcamsCdkLambdaHandler;
  private readonly thumbnailsHandler: TrailcamsCdkLambdaHandler;

  constructor(stack: Stack) {
    this.emailAttachmentHandler = this.createEmailAttachmentHandler(stack);
    this.emailGuardHandler = this.createEmailGuardHandler(stack);
    this.thumbnailsHandler = this.createThumbnailsHandler(stack);
  }

  getEmailAttachmentsHandler(): TrailcamsCdkLambdaHandler {
    return this.emailAttachmentHandler;
  }

  getEmailGuardHandler(): TrailcamsCdkLambdaHandler {
    return this.emailGuardHandler;
  }

  getThumbnailsHandler(): TrailcamsCdkLambdaHandler {
    return this.thumbnailsHandler;
  }

  private createEmailAttachmentHandler(stack: Stack): TrailcamsCdkLambdaHandler {
    const emailAttahcmentHandler = new TrailcamsCdkLambdaHandler(stack, {
      handlerName: "EmailAttachmentLambdaHandler",
      handlerPath: "/../lambda/handler/email-attachment-handler.ts",
    });

    emailAttahcmentHandler.getHandler().addToRolePolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: ["s3:PutObject"],
        resources: [Constants.S3.USER_BUCKET_OBJECTS_ARN_TEMPLATE, Constants.S3.USER_BUCKET_ARN_TEMPLATE],
      })
    );

    return emailAttahcmentHandler;
  }

  private createEmailGuardHandler(stack: Stack): TrailcamsCdkLambdaHandler {
    return new TrailcamsCdkLambdaHandler(stack, {
      handlerName: "EmailGuardHandler",
      handlerPath: "/../lambda/handler/email-guard.ts",
    });
  }

  private createThumbnailsHandler(stack: Stack): TrailcamsCdkLambdaHandler {
    const thumbnailHandler = new TrailcamsCdkLambdaHandler(stack, {
      handlerName: "ThumbnailCreatorHandler",
      handlerPath: "/../lambda/handler/thumbnail-creator-handler.ts",
      nodeModules: ["sharp"],
    });

    thumbnailHandler.getHandler().addToRolePolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: ["s3:GetObject"],
        resources: [Constants.S3.USER_BUCKET_OBJECTS_ARN_TEMPLATE],
      })
    );

    thumbnailHandler.getHandler().addToRolePolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: ["s3:PutObject"],
        resources: [Constants.S3.USER_THUMBNAIL_BUCKET_OBJECTS_ARN_TEMPLATE],
      })
    );

    thumbnailHandler.getHandler().addPermission("s3-premission", {
      principal: new ServicePrincipal("s3.amazonaws.com"),
      action: "lambda:InvokeFunction",
      sourceArn: Constants.S3.USER_BUCKET_ARN_TEMPLATE,
      sourceAccount: stack.account,
    });

    return thumbnailHandler;
  }
}
