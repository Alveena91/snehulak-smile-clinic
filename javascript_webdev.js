// Smooth Scrolling, Menu, Cookies, Privacy 
document.addEventListener("DOMContentLoaded", function () {
    // Smooth scroll for navigation links and scroll arrow
    document.querySelectorAll('nav a[href^="#"], .scroll-arrow').forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href')?.substring(1);
            const target = document.getElementById(targetId);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    // Mobile Menu Toggle
    const menuToggle = document.getElementById("menu-toggle");
    const navList = document.querySelector(".nav-list");
    if (menuToggle && navList) {
        menuToggle.addEventListener("click", () => {
            navList.classList.toggle("active");
        });
    }


    // Cookie Consent Display
    const cookieConsent = document.getElementById("cookieConsent");
    if (!getCookie("cookieConsent") && cookieConsent) {
        cookieConsent.style.display = "flex";
    }

    const acceptBtn = document.getElementById("acceptCookies");
    if (acceptBtn) {
        acceptBtn.addEventListener("click", acceptCookies);
    }

    // Privacy Policy Buttons
    const acceptPrivacyBtn = document.getElementById("acceptPrivacyPolicy");
    const declinePrivacyBtn = document.getElementById("declinePrivacyPolicy");

    if (acceptPrivacyBtn) {
        acceptPrivacyBtn.addEventListener("click", acceptPrivacyPolicy);
    }
    if (declinePrivacyBtn) {
        declinePrivacyBtn.addEventListener("click", declinePrivacyPolicy);
    }

    // Initial scroll arrow setup (if team section is already in DOM)
    setupScrollTeamButtons();
});

//  Dynamic Content Loader
document.querySelectorAll("nav a[data-target]").forEach(link => {
    link.addEventListener("click", event => {
        event.preventDefault();

        const targetFile = event.target.getAttribute("data-target");
        const scrollTargetId = event.target.getAttribute("href")?.substring(1);

        fetch(targetFile)
            .then(response => response.text())
            .then(data => {
                document.getElementById("content").innerHTML = data;

                // Scroll to section if present
                if (scrollTargetId) {
                    const scrollTarget = document.getElementById(scrollTargetId);
                    if (scrollTarget) {
                        setTimeout(() => {
                            scrollTarget.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }, 100);
                    }
                }

                // Re-bind scroll arrow buttons after content is loaded
                setupScrollTeamButtons();
            })
            .catch(error => console.error("Error loading content:", error));
    });
});

// Scroll Buttons for Doctors Section
function setupScrollTeamButtons() {
    const leftArrow = document.querySelector(".left-arrow");
    const rightArrow = document.querySelector(".right-arrow");
    const wrapper = document.querySelector(".team-wrapper");

    if (leftArrow && rightArrow && wrapper) {
        leftArrow.addEventListener("click", () => scrollTeam(-1));
        rightArrow.addEventListener("click", () => scrollTeam(1));
    }
}

function scrollTeam(direction) {
    const wrapper = document.querySelector(".team-wrapper");
    const scrollAmount = 300;
    if (wrapper) {
        wrapper.scrollBy({
            left: direction * scrollAmount,
            behavior: "smooth"
        });
    }
}

// Cookie Consent Actions 
function acceptCookies() {
    const cookieBox = document.getElementById("cookieConsentBox");
    if (cookieBox) cookieBox.style.display = "none";
}

function declineCookies() {
    const cookieBox = document.getElementById("cookieConsentBox");
    if (cookieBox) cookieBox.style.display = "none";
}

//  Privacy Policy Actions
function acceptPrivacyPolicy() {
    const privacyBox = document.getElementById("privacyPolicyBox");
    if (privacyBox) privacyBox.style.display = "none";
}

function declinePrivacyPolicy() {
    const privacyBox = document.getElementById("privacyPolicyBox");
    if (privacyBox) privacyBox.style.display = "none";
}
document.addEventListener("DOMContentLoaded", function () {
    const privacyBox = document.querySelector(".privacy-box");
    const buttons = privacyBox.querySelectorAll("button");

    buttons.forEach(button => {
        button.addEventListener("click", () => {
            privacyBox.style.display = "none";
        });
    });
});
document.getElementById("mainForm").addEventListener("submit", async function (e) {
    e.preventDefault();

    // Disable the submit button to prevent double submission
    const submitBtn = this.querySelector('button[type="submit"], input[type="submit"]');
    if (submitBtn) submitBtn.disabled = true;

    const formData = {
        email: document.getElementById("email").value,
        firstName: document.getElementById("firstname").value,
        lastName: document.getElementById("lastname").value,
        phone: document.getElementById("phone").value,
        appointmentTime: document.getElementById("appointmenttime").value,
        dob: document.getElementById("dob").value,
        treatment: document.getElementById("treatment").value,
        doctor: document.getElementById("doctor").value
    };

    try {
        const response = await fetch("/submit-appointment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData)
        });

        const result = await response.json();
        document.getElementById(result.success ? "successMessage" : "errorMessage").textContent = result.message;
        document.getElementById("successMessage").style.display = result.success ? "block" : "none";
        document.getElementById("errorMessage").style.display = result.success ? "none" : "block";
    } catch (err) {
        document.getElementById("errorMessage").textContent = "Something went wrong.";
        document.getElementById("errorMessage").style.display = "block";
        document.getElementById("successMessage").style.display = "none";
    } finally {
        // Re-enable the submit button after a short delay
        setTimeout(() => {
            if (submitBtn) submitBtn.disabled = false;
        }, 1500);
    }
});



