import { Stack } from "aws-cdk-lib";
import { TrailcamsCdkRekognitionPolicyStatements } from "../rekognition/trailcams-cdk-rekognition-policy-statements";
import { TrailcamsCdkS3Bucket } from "./trailcams-cdk-s3-bucket";

export class TrailcamsCdkS3RekognitionDatasetBucket extends TrailcamsCdkS3Bucket {
  constructor(stack: Stack) {
    super(stack, "trailcams-rekognition-dataset");
    const rekognitionPolicies = new TrailcamsCdkRekognitionPolicyStatements(this.getBucket());

    this.getBucket().addToResourcePolicy(rekognitionPolicies.getPolicies().S3BucketAccess);
    this.getBucket().addToResourcePolicy(rekognitionPolicies.getPolicies().S3ObjectAccess);

    const rekgPutObj = rekognitionPolicies.getPolicies().S3PutObject;
    rekgPutObj.addCondition("StringEquals", {
      "s3:x-amz-acl": "bucket-owner-full-control",
    });

    this.getBucket().addToResourcePolicy(rekgPutObj);
  }
}
