<<<<<<< HEAD
// project.js

const API_URL = 'http://localhost:5000/api/users/profile';

// Save Profile - UPDATED
async function saveProfile(e) {
  e.preventDefault();
  
  const profileData = {
    name: document.getElementById('userName-input').value.trim(),
    email: document.getElementById('userEmail-input').value.trim(),
    branch: document.getElementById('Branch-input').value.trim(),
    year: document.getElementById('GraduationYear-input').value.trim(),
    github: document.getElementById('GitHub-input').value.trim(),
    linkedin: document.getElementById('LinkedIn-input').value.trim(),
    skills: [
      document.getElementById('userSkill1-input').value.trim(),
      document.getElementById('userSkill2-input').value.trim(),
      document.getElementById('userSkill3-input').value.trim(),
      document.getElementById('userSkill4-input').value.trim()
    ].filter(skill => skill) // Filter out empty skills
  };

  try {
    const token = localStorage.getItem('token');
    const response = await fetch(API_URL, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(profileData)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Save failed');
    }

    alert('Profile saved successfully!');
    window.location.reload();

  } catch (err) {
    console.error("Save error:", err);
    document.getElementById('error-message').textContent = err.message;
  }
}

=======
document.getElementById("userId").addEventListener("submit", function(event) {
    event.preventDefault(); // Prevent form refresh

    const form = event.target;
    const inputs = form.querySelectorAll("input");

    inputs.forEach(input => {
        input.readOnly = true;
        input.style.backgroundColor = "#eee"; // Optional visual cue
    });
});

// Unlock fields for editing without clearing values
function enableEditing() {
    const inputs = document.querySelectorAll("#userId input");
    inputs.forEach(input => {
        input.readOnly = false;
        input.style.backgroundColor = ""; // Restore default style
    });
}
>>>>>>> 38ad8ae47f8c730466f2329b349142065584af59
