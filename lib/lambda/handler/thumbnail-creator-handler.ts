import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { Handler } from "aws-lambda";
import sharp = require("sharp");

const s3 = new S3Client({});

/* eslint-disable  @typescript-eslint/no-unused-vars */
export const handler: Handler = async (event, context) => {
  const bucket = event.Records[0].s3.bucket.name as string;
  const sourceKey = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, " "));
  const typeMatch = sourceKey.match(/\.([^.]*)$/);

  if (!typeMatch) {
    console.log("Could not determine the image type.");
    return;
  }

  // Check that the image type is supported
  const imageType = typeMatch[1].toLowerCase();
  if (imageType != "jpg" && imageType != "png" && imageType != "jpeg") {
    console.log(`Unsupported image type: ${imageType}`);
    return;
  }

  // Get the original object
  let originalImage;
  const getObjecCmd: GetObjectCommand = new GetObjectCommand({
    Bucket: bucket,
    Key: sourceKey,
  });

  try {
    originalImage = await s3.send(getObjecCmd);
  } catch (ex) {
    console.log(ex);
    return;
  }

  let buffer;
  try {
    buffer = await sharp(await originalImage.Body?.transformToByteArray(), {})
      .resize(200, 150)
      .toBuffer();
  } catch (ex) {
    console.log(ex);
    return;
  }

  const putObjectCmd: PutObjectCommand = new PutObjectCommand({
    Bucket: bucket + "--thumbnails",
    Key: sourceKey,
    Body: buffer,
    ContentType: "image",
    Metadata: {
      timestamp: originalImage.Metadata?.timestamp || originalImage.LastModified?.toISOString() || "",
    },
  });

  try {
    const putResult = await s3.send(putObjectCmd);
  } catch (ex) {
    console.log(ex);
    return;
  }

  console.log("Successfully resized " + bucket + "/" + sourceKey + " and uploaded to " + bucket + "/" + sourceKey);
  return Promise.resolve(bucket + "/" + sourceKey);
};
