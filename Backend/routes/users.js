const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/auth');

// Get user profile
router.get('/:id', auth, async (req, res) => {
  try {
    const [users] = await db.query(
      `SELECT u.*, GROUP_CONCAT(s.skill_name) as skills 
       FROM users u
       LEFT JOIN userskills us ON u.user_id = us.user_id
       LEFT JOIN skills s ON us.skill_id = s.skill_id
       WHERE u.user_id = ?
       GROUP BY u.user_id`, 
      [req.params.id]
    );
    
    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = users[0];
    user.skills = user.skills ? user.skills.split(',') : [];
    
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update profile
router.put('/:id', auth, async (req, res) => {
  try {
    const { branch, year, linkedIn, github, skills } = req.body;
    
    await db.query(
      'UPDATE users SET user_branch = ?, user_year = ?, linkedIN_link = ?, gitHub_link = ? WHERE user_id = ?',
      [branch, year, linkedIn, github, req.params.id]
    );

    // Update skills
    await db.query('DELETE FROM userskills WHERE user_id = ?', [req.params.id]);
    
    for (const skill of skills) {
      const [existingSkill] = await db.query(
        'SELECT skill_id FROM skills WHERE skill_name = ?', 
        [skill.name]
      );
      
      let skillId;
      if (existingSkill.length > 0) {
        skillId = existingSkill[0].skill_id;
      } else {
        const [newSkill] = await db.query(
          'INSERT INTO skills (skill_name) VALUES (?)', 
          [skill.name]
        );
        skillId = newSkill.insertId;
      }
      
      await db.query(
        'INSERT INTO userskills (user_id, skill_id, experience) VALUES (?, ?, ?)',
        [req.params.id, skillId, skill.experience]
      );
    }

    res.json({ message: 'Profile updated successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;