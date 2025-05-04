const API_URL = "http://localhost:5000/api";
const container = document.getElementById("card-container");

// ======================
// Fetch Users to Swipe On
// ======================
async function fetchUsers(projectId) {
  try {
    const token = localStorage.getItem("token");
    
    if (!token) {
      window.location.href = "/auth/login.html"; // Redirect if not logged in
      return [];
    }

    const response = await fetch(`${API_URL}/swipes/suggestions?projectId=${projectId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) throw new Error("Failed to fetch users");
    return await response.json();
  } catch (err) {
    console.error("Error fetching users:", err);
    return [];
  }
}


// ======================
// Handle Swipe Decisions
// ======================
async function handleDecision(user, decision) {
  try {
    const token = localStorage.getItem("token");
    
    await fetch(`${API_URL}/swipes`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}` 
      },
      body: JSON.stringify({
        swipedId: user.user_id,
        direction: decision === "accept" ? "right" : "left",
      }),
    });

    console.log(`User ${user.username} ${decision === "accept" ? "accepted" : "rejected"}`);
  } catch (err) {
    console.error("Error recording swipe:", err);
  }
}

// ======================
// Create User Cards (UI)
// ======================
function createCard(user, index) {
  const card = document.createElement("div");
  card.className = "card";
  card.innerHTML = `
    <h1>${user.user_name}</h1>  <!-- Correct field name -->
    <p><strong>Year:</strong> ${user.user_year || "N/A"}</p>  <!-- Correct field name -->
    <p><strong>Branch:</strong> ${user.user_branch || "N/A"}</p>  <!-- Correct field name -->
    <p><strong>Skills:</strong> ${user.skills?.join(", ") || "None listed"}</p>
    <div class="label" id="label-${index}"></div>
  `;

  // Swipe logic (left/reject, right/accept)
  let isDragging = false;
  let offsetX = 0;

  card.addEventListener("mousedown", (e) => {
    isDragging = true;
    const startX = e.clientX;
    
    function onMove(e) {
      if (!isDragging) return;
      offsetX = e.clientX - startX;
      card.style.transform = `translateX(${offsetX}px) rotate(${offsetX * 0.1}deg)`;
      
      // Show "ACCEPT" or "REJECT" label
      const label = card.querySelector(".label");
      if (offsetX > 50) {
        label.textContent = "ACCEPT";
        label.style.color = "green";
      } else if (offsetX < -50) {
        label.textContent = "REJECT";
        label.style.color = "red";
      } else {
        label.textContent = "";
      }
    }

    function onEnd() {
      isDragging = false;
      
      // If dragged enough, register swipe
      if (offsetX > 100) {
        handleDecision(user, "accept");
        card.style.transform = `translateX(1000px) rotate(30deg)`;
        setTimeout(() => card.remove(), 300);
      } 
      else if (offsetX < -100) {
        handleDecision(user, "reject");
        card.style.transform = `translateX(-1000px) rotate(-30deg)`;
        setTimeout(() => card.remove(), 300);
      } 
      else {
        // Return to original position
        card.style.transform = "none";
      }

      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onEnd);
    }

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onEnd);
  });

  container.appendChild(card);
}


// ======================
// Initialize Swipe Cards
// ======================
async function init() {
  const projectId = 1; // Example: Set this dynamically based on the selected project
  const users = await fetchUsers(projectId);

  if (users.length === 0) {
    container.innerHTML = `<p style="color: white; text-align: center;">No more users to swipe on!</p>`;
    return;
  }

  users.forEach((user, i) => createCard(user, i));
}

// Start the app
init();