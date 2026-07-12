# FoodShare AWS Deployment Guide

This guide provides instructions and examples to deploy **FoodShare** in your own AWS account.

---

## 📁 Project Folder Structure

```
food-donation-app/
├── backend/
│   ├── src/
│   │   ├── config/ (db.js, s3.js)
│   │   ├── controllers/ (auth.js, donation.js, history.js)
│   │   ├── middleware/ (auth.js)
│   │   ├── routes/ (api.js)
│   │   ├── lambda.js          # Lambda proxy entry point
│   │   └── server.js          # Express local entry point
│   ├── .env.example
│   └── package.json
└── frontend/
    ├── src/
    │   ├── components/ (Navbar, ProtectRoute)
    │   ├── context/ (AuthContext, NotificationContext)
    │   └── pages/ (Home, Login, Register, Dashboards, Details, Profile)
    ├── package.json
    └── tailwind.config.js
```

---

## 🗄️ AWS DynamoDB Table Setup

Run the following commands using the AWS CLI to create the tables in your account:

### 1. Create `Users` Table
```bash
aws dynamodb create-table \
    --table-name Users \
    --attribute-definitions AttributeName=userId,AttributeType=S \
    --key-schema AttributeName=userId,KeyType=HASH \
    --billing-mode PAY_PER_REQUEST
```

### 2. Create `Donations` Table
```bash
aws dynamodb create-table \
    --table-name Donations \
    --attribute-definitions AttributeName=donationId,AttributeType=S \
    --key-schema AttributeName=donationId,KeyType=HASH \
    --billing-mode PAY_PER_REQUEST
```

---

## 🪣 Amazon S3 Bucket & CORS Setup

1. Create an S3 Bucket (e.g. `foodshare-donations`).
2. Turn off "Block all public access" to allow image retrieval (or access them via CloudFront).
3. Apply the following **CORS configuration** on the S3 bucket to enable the frontend to perform presigned uploads directly:

```json
[
    {
        "AllowedHeaders": ["*"],
        "AllowedMethods": ["PUT", "POST", "GET"],
        "AllowedOrigins": ["*"],
        "ExposeHeaders": []
    }
]
```

---

## 🔐 AWS IAM Policy Example

Create an IAM Role for your Lambda function with the following least-privilege policy:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "dynamodb:PutItem",
                "dynamodb:GetItem",
                "dynamodb:Scan",
                "dynamodb:UpdateItem",
                "dynamodb:DeleteItem"
            ],
            "Resource": [
                "arn:aws:dynamodb:*:*:table/Users",
                "arn:aws:dynamodb:*:*:table/Donations"
            ]
        },
        {
            "Effect": "Allow",
            "Action": [
                "s3:PutObject",
                "s3:PutObjectAcl",
                "s3:GetObject"
            ],
            "Resource": "arn:aws:s3:::foodshare-donations/*"
        },
        {
            "Effect": "Allow",
            "Action": [
                "logs:CreateLogGroup",
                "logs:CreateLogStream",
                "logs:PutLogEvents"
            ],
            "Resource": "arn:aws:logs:*:*:*"
        }
    ]
}
```

---

## ⚡ AWS Lambda Deployment Steps

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Package the backend application:
   ```bash
   # Create a zip of backend source code and dependencies
   Compress-Archive -Path src, package.json, node_modules -DestinationPath backend.zip
   ```
3. In the AWS Lambda Console, create a new function (Node.js 18+ or 20+ runtime).
4. Upload `backend.zip` under the **Code** tab.
5. In **Runtime settings**, edit the **Handler** to point to:
   ```text
   src/lambda.handler
   ```
6. In **Configuration** -> **Environment variables**, set:
   * `USE_AWS` = `true`
   * `AWS_REGION` = `us-east-1` (or your region)
   * `USERS_TABLE` = `Users`
   * `DONATIONS_TABLE` = `Donations`
   * `S3_BUCKET_NAME` = `foodshare-donations`
   * `JWT_SECRET` = `your_secure_jwt_secret_key`

---

## 🌐 Amazon API Gateway Setup

To expose the Lambda REST API:
1. Open the Amazon API Gateway Console and choose **Create API** -> **REST API**.
2. Create a resource path using a proxy parameter:
   * Click **Create Resource**. Check **Configure as proxy resource** (Resource Path: `{proxy+}`).
3. Create an **ANY** method inside the `{proxy+}` resource:
   * Integration type: **Lambda Function**.
   * Check **Use Lambda Proxy integration**.
   * Choose your FoodShare Lambda function.
4. Deploy the API to a stage (e.g., `prod`). Note the Stage Invocation URL (e.g. `https://xxx.execute-api.us-east-1.amazonaws.com/prod`).

---

## 🎨 AWS Amplify Frontend Deployment

To host your React SPA:
1. Update `API_BASE_URL` inside `frontend/src/context/AuthContext.jsx` with your API Gateway Stage Invocation URL.
2. In the AWS Amplify Console, click **New App** -> **Host web app**.
3. Link your Git repository (GitHub/GitLab) or upload the static built folder (`frontend/dist`) directly.
4. If building from Git, use this build config:
   ```yaml
   version: 1
   frontend:
     phases:
       preBuild:
         commands:
           - cd frontend
           - npm ci
       build:
         commands:
           - npm run build
     artifacts:
       baseDirectory: frontend/dist
       files:
         - '**/*'
     cache:
       paths:
         - node_modules/**/*
   ```
5. Deploy and access your live application!
