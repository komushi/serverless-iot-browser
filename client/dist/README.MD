# ng-iot-browser
## IoT Browser to AWS IoT Service

----

## 1. Download and install Dependencies
```bash
$ git clone https://github.com/komushi/ng-iot-browser.git
$ cd ng-iot-browser
```

## 2. Setup Cognito Identity Pool
### 2-1. Use CloudFormation Template to setup Cognito Identity Pool
* Use this yaml - ng-iot-browser/cfn/cognito.yaml
* Use a proper EnvId(001 or 002 ... 020)
* [日本語ガイド](http://docs.aws.amazon.com/ja_jp/AWSCloudFormation/latest/UserGuide/cfn-console-create-stack.html)
* [English Guide](http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide／cfn-console-create-stack.html)

### 2-2. Edit config.json
* Edit this config file - ng-iot-browser/config/config.json
* Use the newly created IdentityPoolId from CloudFormation
* Use your AWS IoT endpoint

## 3. Run the application
### 3-1. Option 1: Host the whole folder on an AWS S3 or any preferred environment
* [日本語ガイド](http://docs.aws.amazon.com/ja_jp/AmazonS3/latest/dev/HostingWebsiteOnS3Setup.html)
* [English Guide](http://docs.aws.amazon.com/AmazonS3/latest/dev/HostingWebsiteOnS3Setup.html)

### 3-2. Option 2: Local test with [live-server](https://www.npmjs.com/package/live-server)
```
$ live-server
```


----

## TODO
### Use the following serverless plugin to include this project under iotBrowser-serverless-backend
* https://github.com/serverless/serverless-client-s3
* https://github.com/sbstjn/serverless-stack-output
* https://github.com/funkybob/serverless-s3-deploy
* https://github.com/arabold/serverless-export-env