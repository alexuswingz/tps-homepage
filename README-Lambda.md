# AWS Lambda Function Setup for Plant Identification and Recommendations API

This document explains how to deploy the Lambda function and set up API Gateway to create backend services for the TPS Plant Foods website.

## Overview

The lambda function (`lambda_function.py`) handles two main services:
1. Plant identification using Plant.ID API
2. Product recommendations from Shopify based on identified plants

## Deployment Steps

### 1. Create Lambda Function

1. Log in to AWS Management Console and navigate to Lambda
2. Click "Create function"
3. Select "Author from scratch"
4. Enter the following details:
   - Function name: `tps-plant-api`
   - Runtime: Python 3.9 (or newer)
   - Architecture: x86_64
5. Click "Create function"
6. In the Code source section, upload the `lambda_function.py` file or copy-paste its content
7. Scroll down to "Execution role" and ensure the Lambda has basic Lambda permissions
8. In "General configuration", increase the timeout to 30 seconds (plant identification can take time)
9. Save your changes

### 2. Configure Environment Variables (Optional but Recommended)

Instead of hardcoding API keys in the code, you can store them as environment variables:

1. In the Lambda function configuration, find the "Environment variables" section
2. Add the following environment variables:
   - Key: `PLANT_ID_API_KEY`, Value: `qfE1DVIUgbuivUtkjW8eD5w7xfUPMU9BdfNyONEFhfFZTKO6RT`
   - Key: `SHOPIFY_STORE_DOMAIN`, Value: `https://checkout.tpsplantfoods.com`
   - Key: `SHOPIFY_STOREFRONT_ACCESS_TOKEN`, Value: `d5720278d38b25e4bc1118b31ff0f045`

3. If using environment variables, update the code to use `os.environ.get('VARIABLE_NAME')` instead of the hardcoded values.

### 3. Create API Gateway

1. Navigate to API Gateway in the AWS Management Console
2. Click "Create API"
3. Select "REST API" and click "Build"
4. Choose "New API" and enter the following details:
   - API name: `tps-plant-api-gateway`
   - Description: API for plant identification and recommendations
   - Endpoint Type: Regional
5. Click "Create API"

### 4. Configure API Resources and Methods

#### Create Identify Plant Endpoint

1. Click "Actions" and select "Create Resource"
2. Enter "identify-plant" as Resource Name (and Path Part)
3. Click "Create Resource"
4. With the new resource selected, click "Actions" and select "Create Method"
5. Select "POST" from the dropdown and click the checkmark
6. Configure the method:
   - Integration type: Lambda Function
   - Lambda Function: `tps-plant-api` (the function you created)
   - Use Default Timeout: Yes
7. Click "Save"
8. On the Method Execution screen, click "Integration Request"
9. Expand "Mapping Templates", then:
   - Content-Type: `multipart/form-data` and `application/json`
   - For each, use the passthrough template: `{"body" : $input.json('$'), "headers": { #foreach($header in $input.params().header.keySet()) "$header": "$util.escapeJavaScript($input.params().header.get($header))" #if($foreach.hasNext),#end #end }, "isBase64Encoded": false}`
   
#### Create Recommendations Endpoint

1. Go back to Resources, click on the root (/), then "Actions" → "Create Resource"
2. Enter "get-recommendations" as Resource Name (and Path Part)
3. Click "Create Resource"
4. With the new resource selected, click "Actions" and select "Create Method" 
5. Select "POST" from the dropdown and click the checkmark
6. Configure the method the same way as the previous endpoint
7. Click "Save"

### 5. Enable CORS

1. Select one of your resources (e.g., /identify-plant)
2. Click "Actions" and select "Enable CORS"
3. Configure CORS settings:
   - Access-Control-Allow-Origin: `*` (or your website's domain for production)
   - Access-Control-Allow-Headers: `Content-Type,X-Amz-Date,Authorization,X-Api-Key`
   - Access-Control-Allow-Methods: `OPTIONS,POST`
4. Click "Enable CORS and replace existing CORS headers"
5. Repeat for the /get-recommendations resource

### 6. Deploy the API

1. Click "Actions" and select "Deploy API"
2. Select "New Stage" and enter:
   - Stage name: `prod`
   - Description: Production stage
3. Click "Deploy"
4. Note the "Invoke URL" on the stage editor page – this is your API's base URL

## Update the Frontend Code

Update your frontend to use the new API Gateway endpoints:

1. In `src/app/nutrients/page.tsx`, change the `getApiBaseUrl` function to return your API Gateway URL:

```typescript
function getApiBaseUrl() {
  return 'https://your-api-id.execute-api.your-region.amazonaws.com/prod';
}
```

## Testing

You can test the API with these curl commands:

### Test Plant Identification

```bash
# Replace YOUR_API_URL with your API Gateway URL
curl -X POST \
  YOUR_API_URL/identify-plant \
  -H 'Content-Type: application/json' \
  -d '{"image": "BASE64_ENCODED_IMAGE_DATA"}'
```

### Test Recommendations

```bash
# Replace YOUR_API_URL with your API Gateway URL  
curl -X POST \
  YOUR_API_URL/get-recommendations \
  -H 'Content-Type: application/json' \
  -d '{"plantName": "Monstera"}'
```

## Troubleshooting

### API Gateway Integration Issues

If you're experiencing issues with the Lambda function receiving requests from API Gateway:

1. Verify the API Gateway routes are configured correctly:
   - Ensure both `/identify-plant` and `/get-recommendations` routes are set to POST
   - Check that the routes are integrated with the Lambda function

2. Update the Lambda function to handle API Gateway v2 event format:
   - The Lambda handler has been updated to properly parse both API Gateway v1 (REST API) and v2 (HTTP API) formats
   - Follow these steps to update your Lambda function:

#### Updating the Lambda Function

1. Go to the AWS Lambda Console and navigate to your `tps-plant-api` function
2. Select the "Code" tab
3. Replace the code in `lambda_function.py` with the updated version from this repository
4. Click "Deploy" to save the changes

3. Test the API directly:
   - Use tools like Postman or curl to send test requests to your API Gateway endpoints
   - Example curl command:
   ```
   curl -X POST \
     https://sjjd9r6oo7.execute-api.ap-southeast-2.amazonaws.com/identify-plant \
     -H 'Content-Type: application/json' \
     -d '{"image": "base64_encoded_image_data"}'
   ```

4. CORS Issues:
   - If you're getting CORS errors in the browser, verify your API Gateway has CORS enabled:
     1. In API Gateway console, select your API
     2. Under "Develop" > "CORS", ensure CORS is properly configured
     3. Allowed origins: `*` (for testing) or your specific domain
     4. Allowed methods: `GET, POST, OPTIONS`
     5. Allowed headers: `Content-Type, X-Amz-Date, Authorization, X-Api-Key, X-Amz-Security-Token`
     6. Click "Save" and deploy the changes

5. CloudWatch Logs:
   - Check the CloudWatch Logs for the Lambda function to identify any errors
   - Look for error messages in the log entries to diagnose issues

### Common Issues

1. **API Gateway 500 Errors**: Usually indicates a problem in the Lambda function. Check CloudWatch logs.
2. **CORS Errors**: Verify both the Lambda function and API Gateway CORS settings.
3. **Timeout Errors**: If the Lambda function takes too long to process (especially for large images), increase the timeout setting.
4. **Permission Issues**: Ensure the Lambda has permissions to access any AWS services it needs (S3, Parameter Store, etc.).

## Security Considerations

For production use:
1. Store API keys in AWS Secrets Manager or Parameter Store
2. Restrict CORS to only your website domain
3. Set up proper IAM roles and permissions
4. Consider implementing rate limiting
5. Add authentication to your API endpoints 