const API_URL = "http://localhost:5000/api";

// ======================
// Signup Logic
// ======================
document.getElementById("userId")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const userData = {
        username: document.getElementById("userName-input").value,
        email: document.getElementById("userEmail-input").value,
        password: document.getElementById("userPassword-input").value,
        userType: "student" // Default value
    };

    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(userData)
        });

        const data = await response.json();
        
        if (response.ok) {
            localStorage.setItem("token", data.token);
            window.location.href = "home.html";
        } else {
            document.getElementById("error-message").textContent = data.message || "Signup failed!";
        }
    } catch (err) {
        document.getElementById("error-message").textContent = "Connection error!";
        console.error(err);
    }
});

// ======================
// Login Logic
// ======================
document.getElementById("loginForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const loginData = {
        email: document.getElementById("email").value,
        password: document.getElementById("password").value
    };

    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(loginData)
        });

        const data = await response.json();
        
        if (response.ok) {
            localStorage.setItem("token", data.token);
            window.location.href = "home.html";
        } else {
            document.getElementById("error-message").textContent = data.message || "Login failed!";
        }
    } catch (err) {
        document.getElementById("error-message").textContent = "Connection error!";
        console.error(err);
    }
});

// ======================
// Logout Logic
// ======================
document.getElementById("logout")?.addEventListener("click", () => {
    localStorage.removeItem("token");
    window.location.href = "login.html";
});