# Deploying Your Next.js Site to Amazon S3

This guide will help you deploy your Next.js site to Amazon S3.

## Step 1: Build Your Site

```bash
npm run build
```

This will create a static export in the `out` directory with all your HTML, CSS, and JavaScript files.

## Step 2: Configure S3 Bucket

1. Create an S3 bucket on AWS with a name that matches your domain (e.g., `example.com` or `my-site-bucket`)
2. Enable "Static website hosting" in the bucket properties
3. Set "Index document" to `index.html`
4. Set "Error document" to `404.html` or `index.html`
5. Apply the following bucket policy (replace `your-bucket-name` with your actual bucket name):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::your-bucket-name/*"
    }
  ]
}
```

## Step 3: Upload Files to S3

### Option 1: Using AWS Console
1. Go to your S3 bucket in the AWS Management Console
2. Click "Upload" and select all files and folders from the `out` directory
3. Make sure to maintain the directory structure

### Option 2: Using AWS CLI
If you have AWS CLI installed and configured:

```bash
aws s3 sync out/ s3://your-bucket-name/ --delete
```

## Step 4: Setup CloudFront (Optional but Recommended)

For better performance and HTTPS:

1. Create a CloudFront distribution
2. Set the S3 bucket as the origin
3. Configure the following:
   - "Origin Domain Name": Select your S3 bucket or use the S3 website endpoint
   - "Default Root Object": `index.html`
   - Enable "Compress Objects Automatically"
   - Set "Viewer Protocol Policy" to "Redirect HTTP to HTTPS"
   - In "Custom Error Responses", customize the 404 error to return `/404.html`

## Step 5: Setup Custom Domain (Optional)

If you want to use a custom domain:

1. Configure your domain's DNS to point to your S3 bucket or CloudFront distribution
2. For S3 website endpoints, create a CNAME record pointing to your S3 website URL
3. For CloudFront, create either an A record with Alias to your CloudFront distribution or a CNAME record

## Notes About API Routes

Since you're using a static export, your API routes won't function as they would in a dynamic Next.js app. Consider these alternatives:

1. **AWS Lambda Functions**: Create serverless functions to handle your API needs
2. **API Gateway**: Set up an API Gateway to route requests to your Lambda functions
3. **Third-party Services**: Use services like Supabase, Firebase, or a dedicated backend

## Troubleshooting Common Issues

### 404 Errors on Page Refresh
- Ensure your S3 bucket or CloudFront has proper error handling
- For CloudFront, configure custom error responses to return the appropriate page

### Missing Assets
- Verify all assets were uploaded with the correct paths
- Check for absolute vs. relative paths in your code

### CORS Issues
- Add appropriate CORS configuration to your S3 bucket if accessing resources from other domains 