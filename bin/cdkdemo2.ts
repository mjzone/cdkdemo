#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "@aws-cdk/core";
import { PipelineDemoStack } from "../lib/pipeline";

const app = new cdk.App();
new PipelineDemoStack(app, "PipelineDemoStack", {
    env: {
      account: "885121665536",
      region: "us-east-2",
    },
});
