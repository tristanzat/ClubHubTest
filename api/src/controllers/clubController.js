/**
 * Club Controller
 *
 * Handles all business logic for club-related operations.
 * Connected to PostgreSQL database.
 */

const pool = require('../config/db');

/**
 * GET all clubs
 * Public endpoint - anyone can view clubs
 * Optional query params: ?category=<name> to filter by category
 */
const getAllClubs = async (req, res) => {
  try {
    const { category } = req.query;
    
    let query = `
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
        c.logo_url,
        COALESCE(
          (SELECT JSON_AGG(cat.name ORDER BY cat.name)
           FROM club_categories cc
           JOIN categories cat ON cat.id = cc.category_id
           WHERE cc.club_id = c.id),
          '[]'
        ) AS categories,
        (
          SELECT JSON_BUILD_OBJECT(
            'id', e.id,
            'title', e.title,
            'start_at', e.start_at,
            'location', e.location
          )
          FROM events e
          WHERE e.club_id = c.id
            AND e.start_at > NOW()
            AND e.is_cancelled = FALSE
          ORDER BY e.start_at
          LIMIT 1
        ) AS next_event
      FROM clubs c
      WHERE c.is_active = TRUE
    `;
    
    const params = [];
    
    // Filter by category if provided
    if (category) {
      query += `
        AND EXISTS (
          SELECT 1 FROM club_categories cc
          JOIN categories cat ON cat.id = cc.category_id
          WHERE cc.club_id = c.id AND cat.name ILIKE $1
        )
      `;
      params.push(`%${category}%`);
    }
    
    query += ` ORDER BY c.name`;
    
    const { rows } = await pool.query(query, params);

    res.status(200).json({
      success: true,
      count: rows.length,
      data: rows,
    });
  } catch (error) {
    console.error('getAllClubs error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * GET single club by ID or slug
 * Public endpoint - anyone can view a specific club
 */
const getClubById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if id is numeric or slug
    const isNumeric = /^\d+$/.test(id);
    
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
        c.logo_url,
        c.created_at,
        c.updated_at,
        COALESCE(
          (SELECT JSON_AGG(cat.name ORDER BY cat.name)
           FROM club_categories cc
           JOIN categories cat ON cat.id = cc.category_id
           WHERE cc.club_id = c.id),
          '[]'
        ) AS categories,
        COALESCE(
          (SELECT JSON_AGG(
            JSON_BUILD_OBJECT(
              'id', e.id,
              'title', e.title,
              'description', e.description,
              'start_at', e.start_at,
              'end_at', e.end_at,
              'location', e.location,
              'is_cancelled', e.is_cancelled
            ) ORDER BY e.start_at
          )
          FROM events e
          WHERE e.club_id = c.id AND e.start_at > NOW()),
          '[]'
        ) AS upcoming_events
      FROM clubs c
      WHERE c.is_active = TRUE
        AND ${isNumeric ? 'c.id = $1' : 'c.slug = $1'}
    `;
    
    const { rows } = await pool.query(query, [isNumeric ? parseInt(id) : id]);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Club not found",
      });
    }

    res.status(200).json({
      success: true,
      data: rows[0],
    });
  } catch (error) {
    console.error('getClubById error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * POST create new club
 * Protected endpoint - requires authentication (admin only)
 */
const createClub = async (req, res) => {
  try {
    const {
      name,
      slug,
      short_name,
      description,
      meeting_day,
      meeting_time,
      meeting_location,
      contact_email,
      website_url,
      logo_url,
      categories,
    } = req.body;

    // Validation
    if (!name || !slug) {
      return res.status(400).json({
        success: false,
        error: "Please provide name and slug",
      });
    }

    // Insert club
    const insertQuery = `
      INSERT INTO clubs (
        slug, name, short_name, description, meeting_day, meeting_time,
        meeting_location, contact_email, website_url, logo_url
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;
    
    const { rows } = await pool.query(insertQuery, [
      slug,
      name,
      short_name || null,
      description || null,
      meeting_day || null,
      meeting_time || null,
      meeting_location || null,
      contact_email || null,
      website_url || null,
      logo_url || null,
    ]);
    
    const newClub = rows[0];
    
    // Link categories if provided
    if (categories && Array.isArray(categories) && categories.length > 0) {
      for (const categoryName of categories) {
        await pool.query(
          `INSERT INTO club_categories (club_id, category_id)
           SELECT $1, id FROM categories WHERE name = $2
           ON CONFLICT DO NOTHING`,
          [newClub.id, categoryName]
        );
      }
    }

    res.status(201).json({
      success: true,
      data: newClub,
    });
  } catch (error) {
    console.error('createClub error:', error);
    
    // Handle unique constraint violation
    if (error.code === '23505') {
      return res.status(409).json({
        success: false,
        error: 'Club with this slug already exists',
      });
    }
    
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * PUT update existing club
 * Protected endpoint - requires authentication (admin only)
 */
const updateClub = async (req, res) => {
  try {
    const clubId = parseInt(req.params.id);
    
    const {
      name,
      slug,
      short_name,
      description,
      meeting_day,
      meeting_time,
      meeting_location,
      contact_email,
      website_url,
      logo_url,
      is_active,
    } = req.body;

    // Build dynamic update query
    const updates = [];
    const values = [];
    let paramCount = 1;
    
    if (name !== undefined) { updates.push(`name = $${paramCount++}`); values.push(name); }
    if (slug !== undefined) { updates.push(`slug = $${paramCount++}`); values.push(slug); }
    if (short_name !== undefined) { updates.push(`short_name = $${paramCount++}`); values.push(short_name); }
    if (description !== undefined) { updates.push(`description = $${paramCount++}`); values.push(description); }
    if (meeting_day !== undefined) { updates.push(`meeting_day = $${paramCount++}`); values.push(meeting_day); }
    if (meeting_time !== undefined) { updates.push(`meeting_time = $${paramCount++}`); values.push(meeting_time); }
    if (meeting_location !== undefined) { updates.push(`meeting_location = $${paramCount++}`); values.push(meeting_location); }
    if (contact_email !== undefined) { updates.push(`contact_email = $${paramCount++}`); values.push(contact_email); }
    if (website_url !== undefined) { updates.push(`website_url = $${paramCount++}`); values.push(website_url); }
    if (logo_url !== undefined) { updates.push(`logo_url = $${paramCount++}`); values.push(logo_url); }
    if (is_active !== undefined) { updates.push(`is_active = $${paramCount++}`); values.push(is_active); }
    
    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No fields to update',
      });
    }
    
    values.push(clubId);
    
    const query = `
      UPDATE clubs
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;
    
    const { rows } = await pool.query(query, values);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Club not found",
      });
    }

    res.status(200).json({
      success: true,
      data: rows[0],
    });
  } catch (error) {
    console.error('updateClub error:', error);
    
    if (error.code === '23505') {
      return res.status(409).json({
        success: false,
        error: 'Slug already exists',
      });
    }
    
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * DELETE club
 * Protected endpoint - requires authentication (admin only)
 * Note: Soft delete by setting is_active to false
 */
const deleteClub = async (req, res) => {
  try {
    const clubId = parseInt(req.params.id);

    const query = `
      UPDATE clubs
      SET is_active = FALSE
      WHERE id = $1
      RETURNING id, name
    `;
    
    const { rows } = await pool.query(query, [clubId]);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Club not found",
      });
    }

    res.status(200).json({
      success: true,
      message: `Club "${rows[0].name}" deleted successfully`,
    });
  } catch (error) {
    console.error('deleteClub error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

module.exports = {
  getAllClubs,
  getClubById,
  createClub,
  updateClub,
  deleteClub,
};
