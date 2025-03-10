document.getElementById('contactForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent form from submitting immediately

    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    const email = document.getElementById('email').value.trim();
    const reason = document.getElementById('reason').value;
    const message = document.getElementById('message').value.trim();
    const notRobot = document.getElementById('not-robot').checked;
    const formMessage = document.getElementById('formMessage');

    let valid = true;
    formMessage.textContent = '';

    if (!firstName) {
        formMessage.textContent += 'First Name is required. ';
        valid = false;
    }
    if (!lastName) {
        formMessage.textContent += 'Last Name is required. ';
        valid = false;
    }
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
        formMessage.textContent += 'A valid Email Address is required. ';
        valid = false;
    }
    if (!reason) {
        formMessage.textContent += 'Reason for Enquiry must be selected. ';
        valid = false;
    }
    if (!message) {
        formMessage.textContent += 'Message cannot be empty. ';
        valid = false;
    }
    if (!notRobot) {
        formMessage.textContent += 'Please confirm you are not a robot. ';
        valid = false;
    }

    if (valid) {
        formMessage.classList.remove('error');
        formMessage.classList.add('success');
        formMessage.textContent = 'Form submitted successfully!';
        // You can proceed with form submission, e.g., sending data via AJAX
        // this.submit(); // Uncomment if you want to submit the form after validation
    } else {
        formMessage.classList.remove('success');
        formMessage.classList.add('error');
    }


    document.getElementById("contactForm").addEventListener("submit", function(event) {
        event.preventDefault(); // Prevents the form from actually submitting
    
        // Show confirmation message
        const messageElement = document.getElementById("formMessage");
        messageElement.textContent = "Your form has been submitted!";
        messageElement.classList.add("success"); // Add success class to style the message
    });
});