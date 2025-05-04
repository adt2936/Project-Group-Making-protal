const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const db = require('./db');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const projectRoutes = require('./routes/projects');
const swipeRoutes = require('./routes/swipes');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Serve static files from the Frontend directory
app.use(express.static(path.join(__dirname, '../Frontend')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/swipes', swipeRoutes);

<<<<<<< HEAD
// New Route to Handle Profile Save
app.post('/api/users/profile', async (req, res) => {
  const { userName, userEmail, password, userBranch, userYear, github, linkedin, userSkills } = req.body;

  try {
    // Insert user data into users table
    const insertUserQuery = `
      INSERT INTO users (user_name, user_email, password, user_branch, user_year, linkedIN_link, gitHub_link, user_type)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    db.query(insertUserQuery, [userName, userEmail, password, userBranch, userYear, linkedin, github, 'student'], async (err, result) => {
      if (err) {
        console.error('Error inserting user:', err);
        return res.status(500).json({ success: false, error: 'Error inserting user' });
      }

      // Get the inserted user ID
      const userId = result.insertId;

      // Insert skills into userskills table
      const skillInsertQuery = `INSERT INTO userskills (user_id, skill_id) VALUES (?, ?)`;

      for (const skill of userSkills) {
        if (skill) {
          try {
            // Get the skill ID from the skills table
            const [skillResult] = await db.query(`SELECT skill_id FROM skills WHERE skill_name = ?`, [skill]);

            if (skillResult.length === 0) {
              console.error(`Skill ${skill} not found in database.`);
              // Optionally, insert the skill into the database here if needed
            } else {
              const skillId = skillResult[0].skill_id;
              await db.query(skillInsertQuery, [userId, skillId]);
            }
          } catch (err) {
            console.error('Error processing skill:', err);
          }
        }
      }

      res.status(200).json({ success: true });
    });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// Catch-all for unregistered routes
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found', path: req.originalUrl });
=======
// Serve index.html for all other routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../Frontend/home.html'));
>>>>>>> 38ad8ae47f8c730466f2329b349142065584af59
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
