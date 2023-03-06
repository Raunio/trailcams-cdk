import { Stack } from "aws-cdk-lib";
import { Effect, PolicyStatement, ServicePrincipal } from "aws-cdk-lib/aws-iam";
import { EventType } from "aws-cdk-lib/aws-s3";
import { LambdaDestination } from "aws-cdk-lib/aws-s3-notifications";
import { Constants } from "../constants";
import { TrailcamsCdkLambdaHandler } from "../lambda/trailcams-cdk-lambda-handler";
import { TrailcamsCdkS3Bucket } from "./trailcams-cdk-s3-bucket";

export class TrailcamsCdkS3EmailBucket extends TrailcamsCdkS3Bucket {
  constructor(stack: Stack, emailAttachmentHandler: TrailcamsCdkLambdaHandler) {
    super(stack, Constants.S3.EMAIL_BUCKET_NAME);

    this.getBucket().grantReadWrite(emailAttachmentHandler.getHandler());
    this.getBucket().addEventNotification(
      EventType.OBJECT_CREATED,
      new LambdaDestination(emailAttachmentHandler.getHandler())
    );

    const s3AllowSESPut = new PolicyStatement({
      sid: "AllowSESPut",
      effect: Effect.ALLOW,
      principals: [new ServicePrincipal("ses.amazonaws.com")],
      actions: ["s3:PutObject"],
      resources: [this.getBucket().arnForObjects("*")],
    });

    s3AllowSESPut.addCondition("StringEquals", { "aws:Referer": stack.account });

    this.getBucket().addToResourcePolicy(s3AllowSESPut);
  }
}
