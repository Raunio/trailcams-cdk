import * as cdk from "aws-cdk-lib";
import { ArnPrincipal } from "aws-cdk-lib/aws-iam";
import { Construct } from "constructs";
import { Constants } from "./constants";
import { TrailcamsCdkLambdaHandler } from "./lambda/trailcams-cdk-lambda-handler";
import { TrailcamsCdkS3Bucket } from "./s3/trailcams-cdk-s3-bucket";
import { TrailcamsCdkSESReceiptRules } from "./ses/trailcams-cd-ses-receipt-rules";

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

    const emailBucket = new TrailcamsCdkS3Bucket(this, Constants.EMAIL_BUCKET_NAME);
    emailBucket.getBucket().grantReadWrite(emailAttahcmentHandler.getHandler());

    const SESReceiptRules = new TrailcamsCdkSESReceiptRules(this, "trailcams-receipt-rules", emailBucket.getBucket());
  }
}
