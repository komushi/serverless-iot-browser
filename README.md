# Serverless IoT Browser Demo

Serverless service to showcase DynamoDB stream backend and a Single-Page-Application front end.

## 1. Backend Installation

Make sure that you use Serverless v1.

1. Run `serverless install --url https://github.com/komushi/serverless-iot-browser` to install the service in your current working directory
2. Next up cd into the service with `cd serverless-iot-browser`
3. Run `npm install`
4. Change `provider.environment.ENV_ID`, `provider.region` to your preference in serverless.yml
5. Deploy the backend with `serverless deploy`


## 2. How to use

## 2-1. Option1: Deploy Web UI to S3
1. Deploy the frontend with `serverless client deploy`
2. Access 'http://serverless-iot-browser-<ENV_ID>.s3-website-<region>.amazonaws.com' with your phone, computer, pad...

## 2-2. Option2: Local Test
```
cd serverless-iot-browser/dist/client
live-server
```

## AWS services used
- IoT
- Cognito
- Lambda
- DynamoDB
- S3
- IAM