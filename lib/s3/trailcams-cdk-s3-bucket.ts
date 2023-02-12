import { Stack } from "aws-cdk-lib";
import { AccountRootPrincipal } from "aws-cdk-lib/aws-iam";
import { Key } from "aws-cdk-lib/aws-kms";
import { BlockPublicAccess, Bucket, ObjectOwnership } from "aws-cdk-lib/aws-s3";

export class TrailcamsCdkS3Bucket {
  private bucket: Bucket;

  constructor(stack: Stack, bucketName: string) {
    const s3Bucket = new Bucket(stack, bucketName, {
      objectOwnership: ObjectOwnership.OBJECT_WRITER,
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      encryptionKey: new Key(stack, `${bucketName}KMSKey`),
    });

    s3Bucket.grantRead(new AccountRootPrincipal());

    this.bucket = s3Bucket;
  }

  public getBucket(): Bucket {
    return this.bucket;
  }
}
