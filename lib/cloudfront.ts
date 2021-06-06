import * as cdk from "@aws-cdk/core";
import { Bucket } from "@aws-cdk/aws-s3";
import { BucketDeployment, Source } from "@aws-cdk/aws-s3-deployment";
import * as origins from "@aws-cdk/aws-cloudfront-origins";
import * as acm from "@aws-cdk/aws-certificatemanager";
import {
  OriginAccessIdentity,
  OriginRequestPolicy,
  OriginRequestCookieBehavior,
  OriginRequestQueryStringBehavior,
  Distribution,
  AllowedMethods,
  ViewerProtocolPolicy,
  OriginProtocolPolicy,
} from "@aws-cdk/aws-cloudfront";

interface CustomStackProps extends cdk.StackProps {
  stage: string;
}

export class CloudfrontDemoStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props: CustomStackProps) {
    super(scope, id, props);
    const loadBalancerDomain = cdk.Fn.importValue("loadBalancerUrl");
    const config = this.node.tryGetContext("stages")[props.stage];

    // SSL certificate
    const certificateArn = acm.Certificate.fromCertificateArn(this, "tlsCertificate", config.certificateArn);

    // Web hosting bucket
    let websiteBucket = new Bucket(this, "websiteBucket", {
      versioned: false,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // Trigger deployment
    new BucketDeployment(this, "websiteDeployment", {
      sources: [Source.asset("../cdkdemo2/frontend/app/build")],
      destinationBucket: websiteBucket as any
    });

    // OAI
    const originAccessIdentity = new OriginAccessIdentity(this, "cloudfrontOAI", {
      comment: "OAI for web application cloudfront distribution",
    });

    let cloudFrontDist = new Distribution(this, "cloudfrontDist", {
      defaultRootObject: "index.html",
      domainNames: ["enlearacademy.tk"],
      certificate: certificateArn,
      defaultBehavior: {
        origin: new origins.S3Origin(websiteBucket as any, {
          originAccessIdentity: originAccessIdentity as any,
        }) as any,
        compress: true,
        allowedMethods: AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
        viewerProtocolPolicy: ViewerProtocolPolicy.ALLOW_ALL,
      },
    });

    const loadBalancerOrigin = new origins.HttpOrigin(loadBalancerDomain, {
      protocolPolicy: OriginProtocolPolicy.HTTP_ONLY,
    });

    cloudFrontDist.addBehavior("/generate/*", loadBalancerOrigin as any, {
      compress: true,
      viewerProtocolPolicy: ViewerProtocolPolicy.ALLOW_ALL,
      allowedMethods: AllowedMethods.ALLOW_ALL,
    });

    new cdk.CfnOutput(this, "cloudfrontDomainUrl", {
      value: cloudFrontDist.distributionDomainName,
      exportName: "cloudfrontDomainUrl",
    });
  }
}
