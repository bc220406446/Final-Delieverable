import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';
const Strapi = require('@strapi/strapi');

async function main() {
  // ✅ Proper Strapi init
  const app = await Strapi().load();

  // Cloudinary config
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET,
  });

  // Fetch files
  const files = await app.db.query('plugin::upload.file').findMany();

  console.log(`Found ${files.length} files`);

  for (const file of files) {
    try {
      if (file.url?.includes('cloudinary')) {
        console.log(`Skipping: ${file.name}`);
        continue;
      }

      const filePath = path.join(
        process.cwd(),
        'public',
        file.url.replace('/uploads/', 'uploads/')
      );

      if (!fs.existsSync(filePath)) {
        console.log(`Missing: ${filePath}`);
        continue;
      }

      console.log(`Uploading: ${file.name}`);

      const result = await cloudinary.uploader.upload(filePath, {
        folder: 'strapi_uploads',
      });

      await app.db.query('plugin::upload.file').update({
        where: { id: file.id },
        data: {
          url: result.secure_url,
          provider: 'cloudinary',
        },
      });

      console.log(`Updated: ${file.name}`);
    } catch (err) {
      console.error(`Error: ${file.name}`, err);
    }
  }

  console.log('Migration complete');
  process.exit(0);
}

main();