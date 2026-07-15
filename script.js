// ===========================
// BLUE HARBOR DISPATCH
// script.js
// ===========================

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener("click", function (e) {
        e.preventDefault();

        const target = document.querySelector(this.getAttribute("href"));

        if (target) {
            target.scrollIntoView({
                behavior: "smooth"
            });
        }
    });
});

// Navbar shadow on scroll
const navbar = document.querySelector(".navbar");

window.addEventListener("scroll", () => {

    if (window.scrollY > 50) {

        navbar.style.boxShadow = "0 10px 30px rgba(0,0,0,.12)";

    } else {

        navbar.style.boxShadow = "0 3px 15px rgba(0,0,0,.05)";

    }

});

// Fade-in animation
const observer = new IntersectionObserver((entries) => {

    entries.forEach(entry => {

        if (entry.isIntersecting) {

            entry.target.animate([
                {
                    opacity: 0,
                    transform: "translateY(40px)"
                },
                {
                    opacity: 1,
                    transform: "translateY(0)"
                }

            ], {

                duration: 700,
                easing: "ease-out",
                fill: "forwards"

            });

            observer.unobserve(entry.target);

        }

    });

}, {
    threshold: 0.15
});

document.querySelectorAll(
    ".service-card, .why-card, .step, .faq-item, .trust-card"
).forEach(item => {

    item.style.opacity = "0";

    observer.observe(item);

});

// ===========================
// CONTACT FORM (WEB3FORMS)
// ===========================

const form = document.getElementById("contact-form");
const status = document.getElementById("form-status");

if (form) {

    const submitBtn = form.querySelector("button");

    form.addEventListener("submit", async function (e) {

        e.preventDefault();

        status.textContent = "";
        status.className = "form-status";

        const originalText = submitBtn.textContent;

        submitBtn.textContent = "Sending...";
        submitBtn.disabled = true;

        try {

            const formData = new FormData(form);

            const response = await fetch("https://api.web3forms.com/submit", {
                method: "POST",
                body: formData
            });

            const result = await response.json();

            if (result.success) {

                status.textContent =
                    "✅ Thank you! Your request has been sent successfully. We'll get back to you as soon as possible.";

                status.classList.add("success");

                form.reset();

            } else {

                status.textContent =
                    "❌ Something went wrong. Please try again.";

                status.classList.add("error");

            }

        } catch (error) {

            status.textContent =
                "❌ Network error. Please try again later.";

            status.classList.add("error");

        }

        submitBtn.textContent = originalText;
        submitBtn.disabled = false;

    });

}
document.querySelectorAll(".faq-question").forEach(button => {

    button.addEventListener("click", () => {

        const item = button.parentElement;

        document.querySelectorAll(".faq-item").forEach(faq => {

            if (faq !== item) {
                faq.classList.remove("active");
            }

        });

        item.classList.toggle("active");

    });

});