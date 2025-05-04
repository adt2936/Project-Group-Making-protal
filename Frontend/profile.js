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