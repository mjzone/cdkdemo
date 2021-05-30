import * as cdk from "@aws-cdk/core";
import { Stack, StackProps, Construct, SecretValue } from "@aws-cdk/core";
import { CdkPipeline, SimpleSynthAction } from "@aws-cdk/pipelines";
import * as codepipeline from "@aws-cdk/aws-codepipeline";
import * as codepipeline_actions from "@aws-cdk/aws-codepipeline-actions";

interface CustomStackProps extends cdk.StackProps {
  stage: string;
}

export class PipelineDemoStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props: CustomStackProps) {
    super(scope, id, props);
    const sourceArtifact = new codepipeline.Artifact();
    const cloudAssemblyArtifact = new codepipeline.Artifact();

    const pipeline = new CdkPipeline(this, "Pipeline", {
      pipelineName: "DemoPipeline",
      cloudAssemblyArtifact,

      sourceAction: new codepipeline_actions.GitHubSourceAction({
        actionName: "GitHub",
        output: sourceArtifact,
        oauthToken: SecretValue.secretsManager("github-token") as any,
        trigger: codepipeline_actions.GitHubTrigger.POLL,
        owner: "mjzone",
        repo: "cdkdemo",
        branch: "master"
      }),

      synthAction: SimpleSynthAction.standardNpmSynth({
        sourceArtifact,
        cloudAssemblyArtifact,  
        installCommand: "npm install -g aws-cdk && npm install",
        synthCommand: "cdk synth",
      }),
    });
  }
}
