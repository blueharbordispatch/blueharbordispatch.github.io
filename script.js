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

// Contact form (temporary)
const form = document.querySelector("form");

if (form) {

    form.addEventListener("submit", function (e) {

        e.preventDefault();

        alert(
            "Thank you for contacting Blue Harbor Dispatch. We will get back to you shortly."
        );

        form.reset();

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