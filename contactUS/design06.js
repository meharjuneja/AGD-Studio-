document.getElementById("contactForm").addEventListener("submit", async function (event) {
  event.preventDefault(); // Prevent default form submission

  // Form validation
  let firstName = document.getElementById("firstName").value.trim();
  let lastName = document.getElementById("lastName").value.trim();
  let email = document.getElementById("email").value.trim();
  let reason = document.getElementById("reason").value;
  let message = document.getElementById("message").value.trim();
  let robotCheck = document.getElementById("robotCheck").checked;
  
  let formMessage = document.getElementById("formMessage");
  let successMessage = document.getElementById("successMessage");

  if (!firstName || !lastName || !email || !reason) {
      formMessage.innerText = "⚠️ Please fill out all required fields.";
      return false;
  }
  if (!robotCheck) {
      formMessage.innerText = "⚠️ Please confirm you're not a robot.";
      return false;
  }

  formMessage.innerText = ""; // Clear previous errors

  // Create form data object
  const formData = {
      firstName,
      lastName,
      email,
      reason,
      message
  };

  try {
      let response = await fetch("http://localhost:5000/addContact", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
      });

      let result = await response.json();

      if (response.ok) {
          successMessage.innerText = "✅ Your message has been sent successfully!";
          successMessage.style.display = "block";
          document.getElementById("contactForm").reset();
      } else {
          formMessage.innerText = "❌ Error submitting the form. Please try again.";
      }
  } catch (error) {
      console.error("❌ Form Submission Error:", error);
      formMessage.innerText = "❌ Failed to submit the form. Check your internet connection.";
  }
});