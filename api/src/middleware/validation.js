/**
 * Validation Middleware
 *
 * Request validation helpers for API endpoints.
 */

/**
 * Validate club creation/update requests
 */
const validateClub = (req, res, next) => {
  const { name, slug } = req.body;
  
  const errors = [];
  
  // For POST (creation), require name and slug
  if (req.method === 'POST') {
    if (!name || name.trim().length === 0) {
      errors.push('Name is required');
    }
    if (!slug || slug.trim().length === 0) {
      errors.push('Slug is required');
    }
    if (slug && !/^[a-z0-9-]+$/.test(slug)) {
      errors.push('Slug must contain only lowercase letters, numbers, and hyphens');
    }
  }
  
  // For PUT (update), at least one field should be present
  if (req.method === 'PUT') {
    const hasFields = Object.keys(req.body).length > 0;
    if (!hasFields) {
      errors.push('At least one field must be provided for update');
    }
  }
  
  // Validate email format if provided
  if (req.body.contact_email && req.body.contact_email.trim().length > 0) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(req.body.contact_email)) {
      errors.push('Invalid email format');
    }
  }
  
  // Validate URL format if provided
  if (req.body.website_url && req.body.website_url.trim().length > 0) {
    try {
      new URL(req.body.website_url);
    } catch {
      errors.push('Invalid website URL format');
    }
  }
  
  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      errors,
    });
  }
  
  next();
};

/**
 * Validate numeric ID parameter
 */
const validateId = (req, res, next) => {
  const { id } = req.params;
  
  // Allow both numeric IDs and slugs
  if (!id || id.trim().length === 0) {
    return res.status(400).json({
      success: false,
      error: 'ID or slug is required',
    });
  }
  
  next();
};

module.exports = {
  validateClub,
  validateId,
};
