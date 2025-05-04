const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/auth');

// Record swipe
router.post('/', auth, async (req, res) => {
  try {
    const { swipedId, direction } = req.body;
    
    await db.query(
      'INSERT INTO Swiping (swiper_id, swipedperson_id, swipe) VALUES (?, ?, ?)',
      [req.user.id, swipedId, direction]
    );

    // Check for match
    if (direction === 'right') {
      const [match] = await db.query(
        'SELECT * FROM Swiping WHERE swiper_id = ? AND swipedperson_id = ? AND swipe = "right"',
        [swipedId, req.user.id]
      );
      
      if (match.length > 0) {
        // It's a match!
        // Here you would typically send a notification/email
        return res.json({ match: true });
      }
    }

    res.json({ match: false });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get potential matches
router.get('/suggestions', auth, async (req, res) => {
  try {
    const [users] = await db.query(
      `SELECT u.*, GROUP_CONCAT(s.skill_name) as skills 
       FROM users u
       LEFT JOIN userskills us ON u.user_id = us.user_id
       LEFT JOIN skills s ON us.skill_id = s.skill_id
       WHERE u.user_id != ? 
         AND u.user_id NOT IN (
           SELECT swipedperson_id FROM Swiping WHERE swiper_id = ?
         )
       GROUP BY u.user_id`, 
      [req.user.id, req.user.id]
    );
    
    res.json(users.map(u => ({
      ...u,
      skills: u.skills ? u.skills.split(',') : []
    })));
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;