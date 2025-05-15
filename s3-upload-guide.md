# Uploading Your Static Site to Amazon S3

## 1. Prepare Your S3 Bucket

1. Sign in to the [AWS Management Console](https://aws.amazon.com/console/)
2. Search for "S3" and select the S3 service
3. Click "Create bucket"
4. Name your bucket (ideally matching your domain name, e.g., `example.com`)
5. Choose a region close to your users
6. Uncheck "Block all public access" (since this is a public website)
7. Acknowledge the warning and continue
8. Keep other settings default and click "Create bucket"

## 2. Configure S3 for Static Website Hosting

1. Click on your newly created bucket
2. Go to the "Properties" tab
3. Scroll down to "Static website hosting" and click "Edit"
4. Select "Enable" 
5. Set "Index document" to `index.html`
6. Set "Error document" to `404.html`
7. Click "Save changes"

## 3. Set Bucket Permissions

1. Go to the "Permissions" tab
2. Under "Bucket policy", click "Edit"
3. Paste the following policy (replace `your-bucket-name` with your actual bucket name):

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

4. Click "Save changes"

## 4. Upload Your Files

### Method 1: Using the AWS Console

1. Go to the "Objects" tab
2. Click "Upload"
3. Click "Add files" or "Add folder" and select all contents from your `out` directory
4. Keep default settings and click "Upload"

### Method 2: Using AWS CLI

If you have AWS CLI installed and configured:

```bash
# Navigate to your project directory
cd C:\Users\User\Desktop\TPS-Home\tps-homepage

# Sync the out directory with your S3 bucket
aws s3 sync out/ s3://your-bucket-name/ --delete
```

## 5. Access Your Website

Your website should now be accessible at:
```
http://your-bucket-name.s3-website-your-region.amazonaws.com
```

For example:
```
http://example-bucket.s3-website-us-east-1.amazonaws.com
```

The exact URL will be shown in the "Static website hosting" section of your bucket properties.

## 6. Additional Configuration (Optional)

### Set up CloudFront for HTTPS and better performance:
1. Go to CloudFront in the AWS Console
2. Create a new distribution
3. Select your S3 bucket as the origin
4. Configure settings (HTTPS, caching, etc.)
5. Create the distribution

### Set up a custom domain:
1. Register a domain or use one you already own
2. Create a CNAME record pointing to your S3 website URL or CloudFront distribution
3. If using CloudFront, you can set up a custom SSL certificate using AWS Certificate Manager

## Important Notes

1. Remember that the API functionality won't work in this static export. If needed, implement these features using AWS Lambda and API Gateway.
2. Keep your bucket policy secure and restrict access as needed for your specific use case.
3. Consider setting up CloudFront for better security and performance. 