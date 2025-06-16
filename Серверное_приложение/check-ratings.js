const pool = require('./src/config/database');

async function checkRatings() {
  try {
    console.log('Checking review ratings in the database...');
    
    // Get all reviews with their ratings
    const [reviews] = await pool.execute(`
      SELECT 
        id, 
        comment,
        rating,
        food_rating, 
        service_rating, 
        atmosphere_rating, 
        price_rating, 
        cleanliness_rating 
      FROM reviews 
      LIMIT 10
    `);
    
    console.log(`Found ${reviews.length} reviews`);
    
    // Display each review's ratings
    reviews.forEach(review => {
      console.log(`\nReview ID: ${review.id}`);
      console.log(`Comment: ${review.comment.substring(0, 30)}...`);
      console.log(`Overall Rating: ${review.rating}`);
      console.log(`Food Rating: ${review.food_rating}`);
      console.log(`Service Rating: ${review.service_rating}`);
      console.log(`Atmosphere Rating: ${review.atmosphere_rating}`);
      console.log(`Price Rating: ${review.price_rating}`);
      console.log(`Cleanliness Rating: ${review.cleanliness_rating}`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit();
  }
}

checkRatings(); 