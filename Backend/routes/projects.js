const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/auth');

// Create project
router.post('/', auth, async (req, res) => {
  try {
    const { name, title, description, deadline, skills } = req.body;
    
    const [result] = await db.query(
      'INSERT INTO Project (namepro, pro_title, pro_desciption, deadline, lead_id) VALUES (?, ?, ?, ?, ?)',
      [name, title, description, deadline, req.user.id]
    );

    // Add required skills
    for (const skill of skills) {
      const [existingSkill] = await db.query(
        'SELECT skill_id FROM skills WHERE skill_name = ?', 
        [skill]
      );
      
      let skillId;
      if (existingSkill.length > 0) {
        skillId = existingSkill[0].skill_id;
      } else {
        const [newSkill] = await db.query(
          'INSERT INTO skills (skill_name) VALUES (?)', 
          [skill]
        );
        skillId = newSkill.insertId;
      }
      
      await db.query(
        'INSERT INTO ProjectSkillsRequired (ProjectId, Skill_id) VALUES (?, ?)',
        [result.insertId, skillId]
      );
    }

    res.status(201).json({ projectId: result.insertId });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user projects
router.get('/user/:userId', auth, async (req, res) => {
  try {
    const [projects] = await db.query(
      `SELECT p.*, GROUP_CONCAT(s.skill_name) as skills 
       FROM Project p
       LEFT JOIN ProjectSkillsRequired psr ON p.project_id = psr.ProjectId
       LEFT JOIN skills s ON psr.Skill_id = s.skill_id
       WHERE p.lead_id = ?
       GROUP BY p.project_id`, 
      [req.params.userId]
    );
    
    res.json(projects.map(p => ({
      ...p,
      skills: p.skills ? p.skills.split(',') : []
    })));
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;