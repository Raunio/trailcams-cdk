import { Stack } from "aws-cdk-lib";
import { CfnProject } from "aws-cdk-lib/aws-rekognition";

export class TrailcamsCdkRekognition {
  constructor(stack: Stack, projectName: string) {
    const project: CfnProject = new CfnProject(stack, projectName, { projectName: projectName });
    const dataset: CfnDAtas;
  }
}
