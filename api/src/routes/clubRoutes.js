/**
 * Club Routes
 *
 * Defines all API endpoints for club operations.
 * Routes map HTTP methods (GET, POST, PUT, DELETE) to controller functions.
 */

const express = require("express");
const router = express.Router();
const clubController = require("../controllers/clubController");
const { validateClub, validateId } = require("../middleware/validation");

// Public routes (no authentication required - students can view)
router.get("/", clubController.getAllClubs); // GET /api/clubs
router.get("/:id", validateId, clubController.getClubById); // GET /api/clubs/:id

// Protected routes (require authentication - admin only)
// TODO: Add authentication middleware here when implementing auth
// router.use(authMiddleware);  // Protect all routes below this line

router.post("/", validateClub, clubController.createClub); // POST /api/clubs
router.put("/:id", validateId, validateClub, clubController.updateClub); // PUT /api/clubs/:id
router.delete("/:id", validateId, clubController.deleteClub); // DELETE /api/clubs/:id

module.exports = router;
