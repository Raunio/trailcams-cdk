import * as cdk from "aws-cdk-lib";
import { AccountRootPrincipal, ArnPrincipal, Effect, PolicyStatement, ServicePrincipal } from "aws-cdk-lib/aws-iam";
import { EventType } from "aws-cdk-lib/aws-s3";
import { LambdaDestination } from "aws-cdk-lib/aws-s3-notifications";
import { Construct } from "constructs";
import { Constants } from "./constants";
import { TrailcamsCdkLambdaHandler } from "./lambda/trailcams-cdk-lambda-handler";
import { TrailcamsCdkRekognition } from "./rekognition/trailcams-cdk-rekognition";
import { TrailcamsCdkRekognitionPolicyStatements } from "./rekognition/trailcams-cdk-rekognition-policy-statements";
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

    // TODO: Refactor
    const emailBucket = new TrailcamsCdkS3Bucket(this, Constants.S3.EMAIL_BUCKET_NAME);
    emailBucket.getBucket().grantReadWrite(emailAttahcmentHandler.getHandler());
    emailBucket
      .getBucket()
      .addEventNotification(EventType.OBJECT_CREATED, new LambdaDestination(emailAttahcmentHandler.getHandler()));

    const s3AllowSESPut = new PolicyStatement({
      sid: "AllowSESPut",
      effect: Effect.ALLOW,
      principals: [new ServicePrincipal("ses.amazonaws.com")],
      actions: ["s3:PutObject"],
      resources: [emailBucket.getBucket().arnForObjects("*")],
    });

    s3AllowSESPut.addCondition("StringEquals", { "aws:Referer": this.account });

    emailBucket.getBucket().addToResourcePolicy(s3AllowSESPut);

    const SESReceiptRules = new TrailcamsCdkSESReceiptRules(
      this,
      "trailcams-receipt-rules",
      emailBucket.getBucket(),
      emailGuardHandler.getHandler()
    );

    const rekognitionDatasetBucket = new TrailcamsCdkS3Bucket(this, "trailcams-rekognition-dataset");
    const rekognitionPolicies = new TrailcamsCdkRekognitionPolicyStatements(rekognitionDatasetBucket.getBucket());

    rekognitionDatasetBucket.getBucket().addToResourcePolicy(rekognitionPolicies.getPolicies().S3BucketAccess);
    rekognitionDatasetBucket.getBucket().addToResourcePolicy(rekognitionPolicies.getPolicies().S3ObjectAccess);

    const rekgPutObj = rekognitionPolicies.getPolicies().S3PutObject;
    rekgPutObj.addCondition("StringEquals", {
      "s3:x-amz-acl": "bucket-owner-full-control",
    });
    rekognitionDatasetBucket.getBucket().addToResourcePolicy(rekgPutObj);

    const rekognition = new TrailcamsCdkRekognition(this, "trailcams-custom-labels-project");
  }
}
