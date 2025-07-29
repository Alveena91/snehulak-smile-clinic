// === Smooth scrolling for sidebar navigation ===
document.querySelectorAll('.nav li a').forEach(item => {
    item.addEventListener('click', function (event) {
        event.preventDefault();

        const targetId = event.target.getAttribute('href').substring(1);
        const targetSection = document.getElementById(targetId);

        window.scrollTo({
            top: targetSection.offsetTop - 20,
            behavior: 'smooth'
        });
    });
});

// === Sidebar toggle when clicking "Dashboard" heading ===
document.querySelector(".sidebar-header h2").addEventListener("click", function () {
    const sidebar = document.querySelector(".sidebar");
    sidebar.style.width = sidebar.style.width === "0px" ? "250px" : "0px";
});

// Flag to prevent duplicate loading
let appointmentsLoaded = false;

// Function to remove duplicates
function removeDuplicates() {
    const cards = document.querySelectorAll('.card');
    const seenIds = new Set();
    
    cards.forEach(card => {
        const id = card.id;
        if (seenIds.has(id)) {
            card.remove(); // Remove duplicate
        } else {
            seenIds.add(id);
        }
    });
}

// === Hide/show sections when clicking nav links ===
document.addEventListener("DOMContentLoaded", function () {
    // Remove any duplicates first
    removeDuplicates();
    
    const sections = document.querySelectorAll(".card");
    const links = document.querySelectorAll(".nav a");

    // Remove any existing active classes
    sections.forEach(section => {
        section.classList.remove('active');
    });

    // Show only the first section
    if (sections.length > 0) {
        sections[0].classList.add('active');
    }

    links.forEach(link => {
        link.addEventListener("click", function (e) {
            e.preventDefault();
            const targetId = this.getAttribute("href").substring(1);

            // Remove active class from all sections
            sections.forEach(section => {
                section.classList.remove('active');
            });

            // Add active class to target section
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                targetSection.classList.add('active');
            }
        });
    });

    // Load appointments only once
    if (!appointmentsLoaded) {
        loadAppointments();
        appointmentsLoaded = true;
    }
});

// === Appointment data logic ===

function createTableRows(data) {
    const rows = data.map(d => `
        <tr>
            <td>${d.id}</td>
            <td>${d.email}</td>
            <td>${d.firstName}</td>
            <td>${d.lastName}</td>
            <td>${d.phone}</td>
            <td>${d.appointmentTime}</td>
            <td>${d.dob}</td>
            <td>${d.treatment}</td>
            <td>${d.doctor}</td>
        </tr>
    `).join('');
    return `
        <thead>
            <tr>
                <th>ID</th>
                <th>Email</th>
                <th>First</th>
                <th>Last</th>
                <th>Phone</th>
                <th>Time</th>
                <th>DOB</th>
                <th>Treatment</th>
                <th>Doctor</th>
            </tr>
        </thead>
        <tbody>${rows}</tbody>
    `;
}

function isFuture(dateTimeStr) {
    const now = new Date();
    const dt = new Date(dateTimeStr);
    return dt > now;
}

function isPast(dateTimeStr) {
    const now = new Date();
    const dt = new Date(dateTimeStr);
    return dt < now;
}

async function loadAppointments() {
    try {
        console.log("Loading appointments...");
        const res = await fetch('/appointments');
        console.log("Response status:", res.status);
        
        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }
        
        const appointments = await res.json();
        console.log("Appointments loaded:", appointments);

        const allTable = document.getElementById('allTable');
        const futureTable = document.getElementById('futureTable');
        const pastTable = document.getElementById('pastTable');

        if (!allTable || !futureTable || !pastTable) {
            console.error("Could not find table elements");
            return;
        }

        const future = appointments.filter(app => isFuture(app.appointmentTime));
        const past = appointments.filter(app => isPast(app.appointmentTime));

        console.log("Future appointments:", future);
        console.log("Past appointments:", past);

        allTable.innerHTML = createTableRows(appointments);
        futureTable.innerHTML = createTableRows(future);
        pastTable.innerHTML = createTableRows(past);
        
        console.log("Tables updated successfully");
    } catch (error) {
        console.error("Failed to load appointments:", error);
        // Show error message on page
        const allTable = document.getElementById('allTable');
        if (allTable) {
            allTable.innerHTML = `<tr><td colspan="9" style="text-align: center; color: red;">Error loading appointments: ${error.message}</td></tr>`;
        }
    }
}
