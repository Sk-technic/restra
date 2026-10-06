const fs = require('fs');
const path = require('path');
const https = require('https');

const foodItems = [
  { filename: 'paneer-tikka.jpg', url: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=500&auto=format&fit=crop&q=80' },
  { filename: 'chicken-wings.jpg', url: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=500&auto=format&fit=crop&q=80' },
  { filename: 'nachos.jpg', url: 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=500&auto=format&fit=crop&q=80' },
  { filename: 'butter-chicken.jpg', url: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=500&auto=format&fit=crop&q=80' },
  { filename: 'dal-makhani.jpg', url: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&auto=format&fit=crop&q=80' },
  { filename: 'paneer-butter-masala.jpg', url: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=500&auto=format&fit=crop&q=80' },
  { filename: 'garlic-naan.jpg', url: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=500&auto=format&fit=crop&q=80' },
  { filename: 'hakka-noodles.jpg', url: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=500&auto=format&fit=crop&q=80' },
  { filename: 'chilli-chicken.jpg', url: 'https://images.unsplash.com/photo-1625944525533-473f1a3d54e7?w=500&auto=format&fit=crop&q=80' },
  { filename: 'margherita-pizza.jpg', url: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=500&auto=format&fit=crop&q=80' },
  { filename: 'bbq-pizza.jpg', url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500&auto=format&fit=crop&q=80' },
  { filename: 'veg-burger.jpg', url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=80' },
  { filename: 'chicken-burger.jpg', url: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=500&auto=format&fit=crop&q=80' },
  { filename: 'mojito.jpg', url: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=500&auto=format&fit=crop&q=80' },
  { filename: 'cold-coffee.jpg', url: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=500&auto=format&fit=crop&q=80' },
  { filename: 'brownie.jpg', url: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500&auto=format&fit=crop&q=80' },
  { filename: 'gulab-jamun.jpg', url: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=500&auto=format&fit=crop&q=80' },
];

const categoryItems = [
  { filename: 'starters.jpg', url: 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?w=500&auto=format&fit=crop&q=80' },
  { filename: 'main-course.jpg', url: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=500&auto=format&fit=crop&q=80' },
  { filename: 'chinese.jpg', url: 'https://images.unsplash.com/photo-1525755662778-989d0524087e?w=500&auto=format&fit=crop&q=80' },
  { filename: 'pizza.jpg', url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&auto=format&fit=crop&q=80' },
  { filename: 'burger.jpg', url: 'https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?w=500&auto=format&fit=crop&q=80' },
  { filename: 'drinks.jpg', url: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500&auto=format&fit=crop&q=80' },
  { filename: 'desserts.jpg', url: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=500&auto=format&fit=crop&q=80' },
];

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        // Follow redirect
        return downloadFile(response.headers.location, dest).then(resolve).catch(reject);
      }
      if (response.statusCode !== 200) {
        return reject(new Error(`Failed to download ${url}: status code ${response.statusCode}`));
      }
      const fileStream = fs.createWriteStream(dest);
      response.pipe(fileStream);
      fileStream.on('finish', () => {
        fileStream.close();
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

async function main() {
  const foodDir = path.join(__dirname, '..', 'public', 'images', 'food');
  const catDir = path.join(__dirname, '..', 'public', 'images', 'categories');

  fs.mkdirSync(foodDir, { recursive: true });
  fs.mkdirSync(catDir, { recursive: true });

  console.log('Downloading lightweight high-res food images...');
  for (const item of foodItems) {
    const dest = path.join(foodDir, item.filename);
    try {
      await downloadFile(item.url, dest);
      const size = (fs.statSync(dest).size / 1024).toFixed(1);
      console.log(`✓ Downloaded ${item.filename} (${size} KB)`);
    } catch (err) {
      console.error(`✗ Error downloading ${item.filename}:`, err.message);
    }
  }

  console.log('\nDownloading category banner images...');
  for (const item of categoryItems) {
    const dest = path.join(catDir, item.filename);
    try {
      await downloadFile(item.url, dest);
      const size = (fs.statSync(dest).size / 1024).toFixed(1);
      console.log(`✓ Downloaded ${item.filename} (${size} KB)`);
    } catch (err) {
      console.error(`✗ Error downloading ${item.filename}:`, err.message);
    }
  }

  console.log('\n🎉 All food & category images downloaded successfully!');
}

main();
