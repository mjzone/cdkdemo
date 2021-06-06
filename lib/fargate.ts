import * as cdk from "@aws-cdk/core";
import { Vpc } from "@aws-cdk/aws-ec2";
import * as ecs from "@aws-cdk/aws-ecs";
import * as ecs_patterns from "@aws-cdk/aws-ecs-patterns";

export class FargateDemoStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    
    // VPC
    const vpc = new Vpc(this, "youtubeVPC1", {
      maxAzs: 2,
      natGateways: 1,
    });

    // Fargate cluster
    const cluster = new ecs.Cluster(this, "youtubeCluster1", {
      vpc: vpc,
    });

    // Fargate service
    const backendService = new ecs_patterns.ApplicationLoadBalancedFargateService(this, "backendService1", {
      cluster: cluster,
      memoryLimitMiB: 1024,
      cpu: 512,
      desiredCount: 2,
      taskImageOptions: {
        image: ecs.ContainerImage.fromAsset("../cdkdemo2/backend/"),
        environment: {
          myVar: "variable01",
        },
      },
    });

    // Health check
    backendService.targetGroup.configureHealthCheck({ path: "/health" });

    // Load balancer url
    new cdk.CfnOutput(this, "loadBalancerUrl1", {
      value: backendService.loadBalancer.loadBalancerDnsName,
      exportName: "loadBalancerUrl1",
    });
  }
}
