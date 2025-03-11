document
  .getElementById("contactForm")
  .addEventListener("submit", async function (event) {
    event.preventDefault(); // Prevent form from submitting immediately

    // Collect input values and trim as needed
    const firstName = document.getElementById("firstName").value.trim();
    const lastName = document.getElementById("lastName").value.trim();
    const email = document.getElementById("email").value.trim();
    const reason = document.getElementById("reason").value;
    const message = document.getElementById("message").value.trim();
    // Update the id here to match your HTML if necessary
    const notRobot = document.getElementById("robotCheck").checked;
    const formMessage = document.getElementById("formMessage");

    let valid = true;
    formMessage.textContent = "";

    // Validate each field and update the valid flag and error message if needed
    if (!firstName) {
      formMessage.textContent += "First Name is required. ";
      valid = false;
    }
    if (!lastName) {
      formMessage.textContent += "Last Name is required. ";
      valid = false;
    }
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      formMessage.textContent += "A valid Email Address is required. ";
      valid = false;
    }
    if (!reason || reason === "Reason for Enquiry") {
      formMessage.textContent += "Reason for Enquiry must be selected. ";
      valid = false;
    }
    if (!message) {
      formMessage.textContent += "Message cannot be empty. ";
      valid = false;
    }
    if (!notRobot) {
      formMessage.textContent += "Please confirm you are not a robot. ";
      valid = false;
    }

    // If all validations pass, proceed to send data to the backend
    if (valid) {
      formMessage.classList.remove("error");
      formMessage.classList.add("success");
      formMessage.textContent = "Submitting form...";

      try {
        // Send data to the backend using the Fetch API
        const response = await fetch("http://localhost:5000/submit-form", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            firstName: firstName,
            lastName: lastName,
            email: email,
            reason: reason,
            message: message,
          }),
        });

        const data = await response.json();
        if (data.success) {
          formMessage.textContent = data.message; // e.g., "Form submitted successfully!"
          document.getElementById("contactForm").reset(); // Clear form on success
        } else {
          formMessage.textContent =
            data.message || "There was an error submitting the form.";
          formMessage.classList.remove("success");
          formMessage.classList.add("error");
        }
      } catch (error) {
        console.error("Error:", error);
        formMessage.textContent =
          "There was an error submitting the form. Please try again.";
        formMessage.classList.remove("success");
        formMessage.classList.add("error");
      }
    } else {
      // If not valid, ensure the error styling is applied
      formMessage.classList.remove("success");
      formMessage.classList.add("error");
    }
  });
