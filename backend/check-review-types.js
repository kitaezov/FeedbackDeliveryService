const pool = require('./src/config/database');

async function checkReviewTypes() {
  try {
    console.log('Checking review types in the database...');
    
    // Get all reviews with their types
    const [reviews] = await pool.execute(`
      SELECT 
        id, 
        comment,
        rating,
        type
      FROM reviews 
      LIMIT 10
    `);
    
    console.log(`Found ${reviews.length} reviews`);
    
    // Display each review's type
    reviews.forEach(review => {
      console.log(`\nReview ID: ${review.id}`);
      console.log(`Comment: ${review.comment.substring(0, 30)}...`);
      console.log(`Type: ${review.type || 'Not specified'}`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit();
  }
}

checkReviewTypes(); 