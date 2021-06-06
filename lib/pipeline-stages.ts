import * as cdk from "@aws-cdk/core";
import { Construct, Stage, StageProps } from "@aws-cdk/core";

// Application stacks
import { FargateDemoStack } from "../lib/fargate";
import { CloudfrontDemoStack } from "../lib/cloudfront";

interface CustomStackProps extends cdk.StackProps {
  stage: string;
}

export class MyApplication extends Stage {
  constructor(scope: Construct, id: string, props?: CustomStackProps) {
    super(scope, id, props);

    new FargateDemoStack(this, "FarageDemoStack");
    new CloudfrontDemoStack(this, "CloudfrontDemoStack", { stage: props?.stage as string });
  }
}
