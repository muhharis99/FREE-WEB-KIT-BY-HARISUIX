// Premium company profile interactions

document.addEventListener("DOMContentLoaded", function () {
    const navbar = document.getElementById("mainNavbar");
    const navLinks = document.querySelectorAll(".nav-link");
    const sections = document.querySelectorAll("main section[id]");
    const revealElements = document.querySelectorAll(".reveal");
    const portfolioModal = document.getElementById("portfolioModal");
    const contactForm = document.querySelector(".contact-form");
    const navbarCollapse = document.querySelector(".navbar-collapse");
    const navbarToggler = document.querySelector(".navbar-toggler");

    // Update navbar style on scroll.
    function updateNavbarState() {
        if (window.scrollY > 24) {
            navbar.classList.add("scrolled");
        } else {
            navbar.classList.remove("scrolled");
        }
    }

    // Keep the active nav item aligned with the visible section.
    function updateActiveLink() {
        const scrollPosition = window.scrollY + 130;

        sections.forEach(function (section) {
            const top = section.offsetTop;
            const bottom = top + section.offsetHeight;
            const id = section.getAttribute("id");

            if (scrollPosition >= top && scrollPosition < bottom) {
                navLinks.forEach(function (link) {
                    link.classList.toggle("active", link.getAttribute("href") === "#" + id);
                });
            }
        });
    }

    updateNavbarState();
    updateActiveLink();

    window.addEventListener("scroll", function () {
        updateNavbarState();
        updateActiveLink();
    });

    // Close the mobile menu after choosing a navigation item.
    navLinks.forEach(function (link) {
        link.addEventListener("click", function () {
            if (window.innerWidth < 992 && navbarCollapse.classList.contains("show")) {
                navbarToggler.click();
            }
        });
    });

    // Reveal content as the user scrolls for a polished entrance effect.
    if ("IntersectionObserver" in window) {
        const observer = new IntersectionObserver(function (entries, currentObserver) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add("is-visible");
                    currentObserver.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.15,
            rootMargin: "0px 0px -40px 0px"
        });

        revealElements.forEach(function (element) {
            observer.observe(element);
        });
    } else {
        revealElements.forEach(function (element) {
            element.classList.add("is-visible");
        });
    }

    // Populate the portfolio modal based on the selected project.
    if (portfolioModal) {
        portfolioModal.addEventListener("show.bs.modal", function (event) {
            const trigger = event.relatedTarget;
            if (!trigger) {
                return;
            }

            document.getElementById("portfolioModalLabel").textContent = trigger.getAttribute("data-title") || "Project Detail";
            document.getElementById("portfolioModalCategory").textContent = trigger.getAttribute("data-category") || "Project Category";
            document.getElementById("portfolioModalDescription").textContent = trigger.getAttribute("data-description") || "More information will appear here.";
            document.getElementById("portfolioModalImage").src = trigger.getAttribute("data-image") || "";
        });
    }

    // Demo form feedback for a cleaner prototype experience.
    if (contactForm) {
        contactForm.addEventListener("submit", function (event) {
            event.preventDefault();
            const submitButton = contactForm.querySelector("button[type='submit']");
            submitButton.textContent = "Message Sent";
            submitButton.disabled = true;

            setTimeout(function () {
                submitButton.textContent = "Send Message";
                submitButton.disabled = false;
                contactForm.reset();
            }, 2200);
        });
    }
});
