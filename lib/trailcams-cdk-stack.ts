import * as cdk from "aws-cdk-lib";
import { ArnPrincipal } from "aws-cdk-lib/aws-iam";
import { Construct } from "constructs";
import { Constants } from "./constants";
import { TrailcamsCdkLambdaHandler } from "./lambda/trailcams-cdk-lambda-handler";
import { TrailcamsCdkS3Bucket } from "./s3/trailcams-cdk-s3-bucket";

export class TrailcamsCdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const emailAttahcmentHandler = new TrailcamsCdkLambdaHandler(
      this,
      "EmailAttachmentLambdaHandler",
      "/../lambda/handler/email-attachment-handler.ts"
    );
    const emailGuardHandler = new TrailcamsCdkLambdaHandler(
      this,
      "EmailGuardHandler",
      "/../lambda/handler/email-guard.ts"
    );

    const bucket = new TrailcamsCdkS3Bucket(this, Constants.EMAIL_ATTACHMENT_BUCKET_NAME);
    bucket.getBucket().grantReadWrite(new ArnPrincipal(emailAttahcmentHandler.getHandler().functionArn));
  }
}
