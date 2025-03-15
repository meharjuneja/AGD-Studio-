document.getElementById("signupForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const thankYouMessage = document.getElementById("thankYouMessage");

  if (!email) {
      alert("Please enter a valid email.");
      return;
  }

  try {
    const response = await fetch("http://localhost:5000/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();

    if (response.ok) {
      thankYouMessage.style.display = "block";
      document.getElementById("signupForm").reset(); // ✅ Reset form after successful submission
    } else {
      alert(data.error); // ✅ Show backend error message
    }
  } catch (error) {
    alert("Subscription failed. Please try again.");
  }
});
async function subscribe() {
  const email = document.getElementById('email').value;
  
  try {
    const response = await fetch('http://localhost:5000/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    
    const result = await response.json();
    alert(result.success ? "✅ " + result.message : "❌ " + result.error);
  } catch (error) {
    alert("⚠️ Connection error");
  }
}
