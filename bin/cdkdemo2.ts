#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "@aws-cdk/core";
import { PipelineDemoStack } from "../lib/pipeline";

const app = new cdk.App();
new PipelineDemoStack(app, "PipelineDemoStack", {
  stage: "prod",
  //   env: {
  //     account: "111111111111",
  //     region: "eu-west-1",
  //   },
});
