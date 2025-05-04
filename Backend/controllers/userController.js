// userController.js

const db = require('../db'); // Assuming db.js has a connection to MySQL

// Save Profile
exports.saveProfile = async (req, res) => {
  const { name, email, branch, year, github, linkedin, skills } = req.body;
  const userId = req.user.id; // Assuming the user ID is coming from JWT token

  try {
    // Update or insert user information into the `users` table
    const updateUserQuery = `
      UPDATE users 
      SET user_name = ?, user_email = ?, user_branch = ?, user_year = ?, gitHub_link = ?, linkedIN_link = ? 
      WHERE user_id = ?;
    `;
    await db.execute(updateUserQuery, [name, email, branch, year, github, linkedin, userId]);

    // Insert the skills into the `userskills` table
    // First, we delete existing skills linked to the user to avoid duplicates
    const deleteSkillsQuery = 'DELETE FROM userskills WHERE user_id = ?';
    await db.execute(deleteSkillsQuery, [userId]);

    // Now, insert new skills
    const insertSkillsQuery = 'INSERT INTO userskills (user_id, skill_id, eperience) VALUES (?, ?, ?)';
    for (const skillName of skills) {
      // Get skill ID from the `skills` table
      const getSkillIdQuery = 'SELECT skill_id FROM skills WHERE skill_name = ?';
      const [skill] = await db.execute(getSkillIdQuery, [skillName]);

      if (skill.length > 0) {
        // Insert each skill for the user
        await db.execute(insertSkillsQuery, [userId, skill[0].skill_id, 0]); // Assuming `experience` is 0 for now
      }
    }

    res.status(200).json({ message: 'Profile saved successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
