const pool = require('./src/config/database');

async function test() {
  try {
    console.log('Simulating manager reviews API response...');
    
    // Get a manager user ID
    const [managers] = await pool.execute(`
      SELECT id FROM users WHERE role = 'manager' LIMIT 1
    `);
    
    if (managers.length === 0) {
      console.log('No manager users found');
      return;
    }
    
    const managerId = managers[0].id;
    console.log(`Found manager with ID: ${managerId}`);
    
    // Get restaurant ID for this manager
    const [managerRestaurants] = await pool.execute(`
      SELECT restaurant_id FROM users WHERE id = ? AND role = 'manager'
    `, [managerId]);
    
    if (managerRestaurants.length === 0 || !managerRestaurants[0].restaurant_id) {
      console.log('Manager is not assigned to any restaurant');
      return;
    }
    
    const restaurantId = managerRestaurants[0].restaurant_id;
    console.log(`Manager is assigned to restaurant ID: ${restaurantId}`);
    
    // Get reviews for this restaurant
    const [reviews] = await pool.execute(`
      SELECT 
        r.*,
        u.name as user_name,
        u.avatar as user_avatar,
        rest.name as restaurant_name,
        IFNULL(r.manager_name, 
            (SELECT name FROM users WHERE id = r.responded_by LIMIT 1)
        ) as manager_name
      FROM reviews r
      LEFT JOIN users u ON r.user_id = u.id
      LEFT JOIN restaurants rest ON r.restaurant_id = rest.id
      WHERE r.deleted = 0 
      AND (r.restaurant_id = ? OR rest.id = ?)
      ORDER BY r.created_at DESC
    `, [restaurantId, restaurantId]);
    
    console.log(`Found ${reviews.length} reviews for restaurant ID: ${restaurantId}`);
    
    // Get photos for each review
    for (const review of reviews) {
      const [reviewPhotos] = await pool.execute(`
        SELECT * FROM review_photos WHERE review_id = ?
      `, [review.id]);
      
      review.photos = reviewPhotos;
      console.log(`Review ID ${review.id} has ${reviewPhotos.length} photos`);
      
      if (reviewPhotos.length > 0) {
        console.log('Sample photo:', JSON.stringify(reviewPhotos[0], null, 2));
      }
    }
    
    // Format the response like the manager controller does
    const formattedReviews = reviews.map(review => ({
      id: review.id,
      user_id: review.user_id,
      restaurant_id: review.restaurant_id,
      restaurant_name: review.restaurant_name,
      rating: review.rating,
      comment: review.comment,
      created_at: review.created_at,
      updated_at: review.updated_at,
      user_name: review.user_name,
      user_avatar: review.user_avatar,
      response: review.response,
      response_date: review.response_date,
      manager_name: review.manager_name,
      has_response: Boolean(review.response),
      deleted: review.deleted === 1,
      food_rating: review.food_rating,
      service_rating: review.service_rating,
      atmosphere_rating: review.atmosphere_rating,
      price_rating: review.price_rating,
      cleanliness_rating: review.cleanliness_rating,
      photos: review.photos.map(photo => {
        try {
          // Try to parse the photo_url if it's a JSON string
          const parsedUrl = JSON.parse(photo.photo_url);
          return parsedUrl;
        } catch (e) {
          // If not JSON, return as is
          return { url: photo.photo_url };
        }
      })
    }));
    
    console.log('\nFormatted reviews that would be sent to frontend:');
    console.log(JSON.stringify(formattedReviews, null, 2));
  } catch (err) {
    console.error('Error:', err);
  } finally {
    process.exit();
  }
}

test(); 