/**
 * Category Controller
 *
 * Handles category-related operations for filtering clubs.
 */

const pool = require('../config/db');

/**
 * GET all categories
 * Public endpoint - anyone can view categories for filtering
 */
const getAllCategories = async (req, res) => {
  try {
    const query = `
      SELECT 
        cat.id,
        cat.name,
        cat.description,
        COUNT(DISTINCT cc.club_id) AS club_count
      FROM categories cat
      LEFT JOIN club_categories cc ON cc.category_id = cat.id
      LEFT JOIN clubs c ON c.id = cc.club_id AND c.is_active = TRUE
      GROUP BY cat.id, cat.name, cat.description
      ORDER BY cat.name
    `;
    
    const { rows } = await pool.query(query);

    res.status(200).json({
      success: true,
      count: rows.length,
      data: rows,
    });
  } catch (error) {
    console.error('getAllCategories error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * GET clubs by category
 * Public endpoint - get all clubs in a specific category
 */
const getClubsByCategory = async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = `
      SELECT 
        c.id,
        c.slug,
        c.name,
        c.short_name,
        c.description,
        c.meeting_day,
        c.meeting_time,
        c.meeting_location,
        c.contact_email,
        c.website_url,
        c.logo_url
      FROM clubs c
      JOIN club_categories cc ON cc.club_id = c.id
      JOIN categories cat ON cat.id = cc.category_id
      WHERE cat.id = $1 AND c.is_active = TRUE
      ORDER BY c.name
    `;
    
    const { rows } = await pool.query(query, [parseInt(id)]);

    res.status(200).json({
      success: true,
      count: rows.length,
      data: rows,
    });
  } catch (error) {
    console.error('getClubsByCategory error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

module.exports = {
  getAllCategories,
  getClubsByCategory,
};
