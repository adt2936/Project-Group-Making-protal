const express = require('express');
const router = express.Router();
const db = require('../db');
const authMiddleware = require('../middleware/auth');

// Update user profile and skills
router.put('/profile', authMiddleware, async (req, res) => {
  const userId = req.user.id;  // Assuming user ID is passed through the JWT
  const { name, email, branch, year, github, linkedin, skills } = req.body;

  try {
    // 1. Update user basic info in the `users` table
    await db.query(
      `UPDATE users SET user_name = ?, user_email = ?, user_branch = ?, user_year = ?, gitHub_link = ?, linkedIN_link = ? WHERE user_id = ?`,
      [name, email, branch, year, github, linkedin, userId]
    );

    // 2. Process skills (insert if not exists) without experience
    const skillIds = [];
    for (const skill of skills) {
      // Check if the skill already exists in the `skills` table
      const [existing] = await db.query(`SELECT skill_id FROM skills WHERE skill_name = ?`, [skill]);
      let skillId;
      
      if (existing.length > 0) {
        // If skill exists, use the existing skill_id
        skillId = existing[0].skill_id;
      } else {
        // Insert new skill if it doesn't exist
        const result = await db.query(`INSERT INTO skills (skill_name) VALUES (?)`, [skill]);
        skillId = result[0].insertId;
      }

      skillIds.push(skillId);  // Store skillId for insertion into `userskills`
    }

    // 3. Clear old user skills in the `userskills` table
    await db.query(`DELETE FROM userskills WHERE user_id = ?`, [userId]);

    // 4. Insert new user skills into the `userskills` table
    for (const skillId of skillIds) {
      await db.query(
        `INSERT INTO userskills (user_id, skill_id) VALUES (?, ?)`,
        [userId, skillId]
      );
    }

    // Send success response
    res.json({ message: 'Profile updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error while updating profile' });
  }
});

module.exports = router;
