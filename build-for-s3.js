const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Directory paths
const apiDir = path.join(__dirname, 'src', 'app', 'api');
const backupDir = path.join(__dirname, 'api-backup');

// Create backup directory if it doesn't exist
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir);
}

function copyDir(src, dest) {
  // Create destination directory if it doesn't exist
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  
  // Get all items in source directory
  const items = fs.readdirSync(src);
  
  // Copy each item to destination
  for (const item of items) {
    const srcPath = path.join(src, item);
    const destPath = path.join(dest, item);
    
    const stats = fs.statSync(srcPath);
    
    if (stats.isDirectory()) {
      // Recursively copy subdirectories
      copyDir(srcPath, destPath);
    } else {
      // Copy files
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// Step 1: Backup the API directory
console.log('Backing up API directory...');
copyDir(apiDir, backupDir);

// Step 2: Remove API directory for static build
console.log('Temporarily removing API directory for static build...');
fs.rmSync(apiDir, { recursive: true, force: true });

try {
  // Step 3: Run the build
  console.log('Building the project...');
  execSync('npm run build', { stdio: 'inherit' });
  
  console.log('Static build completed successfully!');
} catch (error) {
  console.error('Build failed:', error);
} finally {
  // Step 4: Restore API directory
  console.log('Restoring API directory...');
  fs.rmSync(apiDir, { recursive: true, force: true });
  copyDir(backupDir, apiDir);
  
  console.log('API directory restored.');
  console.log('Your static files are ready in the "out" directory!');
} 