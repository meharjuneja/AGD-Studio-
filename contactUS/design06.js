document.addEventListener("DOMContentLoaded", function () {
    let contactForm = document.getElementById("contactForm");

    if (!contactForm) {
        console.error("❌ Form with ID 'contactForm' not found!");
        return;
    }

    contactForm.addEventListener("submit", async function (event) {
        event.preventDefault(); // Prevent default form submission

        let formMessage = document.getElementById("formMessage");
        let successMessage = document.getElementById("successMessage");

        if (!formMessage || !successMessage) {
            console.error("❌ Error: Missing form message elements in HTML.");
            return;
        }

        // Validate form
        const formData = validateForm();
        if (!formData) return; // Stop submission if validation fails

        try {
            let response = await fetch("http://localhost:8000/addContact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            let contentType = response.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                throw new Error("Server did not return a valid JSON response.");
            }

            let result = await response.json();

            if (response.ok) {
                successMessage.innerText = "✅ Your message has been sent successfully!";
                successMessage.style.display = "block";
                contactForm.reset();
            } else {
                formMessage.innerText = `❌ ${result.message || "Error submitting the form. Please try again."}`;
            }
        } catch (error) {
            console.error("❌ Form Submission Error:", error);
            formMessage.innerText = "❌ Failed to submit the form. Please check your internet connection or backend.";
        }
    });

    function validateForm() {
        let firstName = document.getElementById("firstName")?.value.trim();
        let lastName = document.getElementById("lastName")?.value.trim();
        let email = document.getElementById("email")?.value.trim();
        let reason = document.getElementById("reason")?.value;
        let message = document.getElementById("message")?.value.trim();
        let robotCheck = document.getElementById("robotCheck")?.checked;
        let formMessage = document.getElementById("formMessage");

        if (!firstName || !lastName || !email || !reason) {
            formMessage.innerText = "⚠️ Please fill out all required fields.";
            return null;
        }
        if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
            formMessage.innerText = "⚠️ Please enter a valid email address.";
            return null;
        }
        if (!robotCheck) {
            formMessage.innerText = "⚠️ Please confirm you're not a robot.";
            return null;
        }

        formMessage.innerText = ""; // Clear any previous errors
        return { firstName, lastName, email, reason, message };
    }
});
