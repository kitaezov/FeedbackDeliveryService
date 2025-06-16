const pool = require('./src/config/database');

async function test() {
  try {
    console.log('Checking reviews in database...');
    const [reviews] = await pool.execute('SELECT * FROM reviews LIMIT 5');
    console.log('Reviews found:', reviews.length);
    console.log(JSON.stringify(reviews, null, 2));
    
    // Check for review photos
    console.log('\nChecking review photos...');
    const [photos] = await pool.execute('SHOW TABLES LIKE "review_photos"');
    if (photos.length > 0) {
      const [reviewPhotos] = await pool.execute('SELECT * FROM review_photos LIMIT 10');
      console.log('Photos found:', reviewPhotos.length);
      console.log(JSON.stringify(reviewPhotos, null, 2));
    } else {
      console.log('review_photos table does not exist');
    }
  } catch (err) {
    console.error('Error:', err);
  } finally {
    process.exit();
  }
}

test(); 