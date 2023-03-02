import { S3Client } from "@aws-sdk/client-s3";
import { Handler } from "aws-lambda";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { RekognitionClient, DetectLabelsCommand } from "@aws-sdk/client-rekognition";

export const handler: Handler = async (event, context) => {
  console.log(JSON.stringify(event));

  const s3 = new S3Client({});
  const dynamoDb = new DynamoDBClient({});

  const bucket = event.Records[0].s3.bucket.name;
  const sourceKey = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, " "));

  if (!bucket || !sourceKey) {
    console.log(`Looks like something is wrong with the request\nBucket: ${bucket}\nKey: ${sourceKey}`);
    return;
  }

  const labels = await rekogniseGetLabels(bucket, sourceKey);

  if (!labels) {
    console.log("Got an empty response from rekognition.");
    return;
  }
};

/**
 * Calls the Rekognition get labels api and returns its response
 * @param {*} bucket S3 bucket where the image is stored
 * @param {*} key S3 object key for the image
 * @returns Response from Rekognition
 */
const rekogniseGetLabels = async (bucket: string, key: string) => {
  const rekognition = new RekognitionClient({});

  const rekognitionRequest: DetectLabelsCommand = new DetectLabelsCommand({
    Image: {
      S3Object: {
        Bucket: bucket,
        Name: key,
      },
    },
    //MaxLabels: maxLabels,
    //MinConfidence: minConfidence,
  });

  let resp = {};

  try {
    resp = await rekognition.send(rekognitionRequest);
  } catch (err) {
    console.log(err);
  }

  return resp;
};
