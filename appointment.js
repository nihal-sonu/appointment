const appointmentsBody = document.getElementById("appointmentsBody");
const filterPatient = document.getElementById("filterPatient");
const filterDoctor = document.getElementById("filterDoctor");
const filterDate = document.getElementById("filterDate");
const heading = document.getElementById("selectedDateHeading");
const updateBtn = document.getElementById("updateBtn");

let appointments = JSON.parse(localStorage.getItem("appointments")) || [];

/* Format Date for UI */
function formatDate(dateStr) {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { 
        day: "2-digit", 
        month: "short", 
        year: "numeric" 
    });
}

/* Render Table */
function renderAppointments(list) {
    appointmentsBody.innerHTML = "";

    heading.textContent = filterDate.value
        ? `Appointments on ${formatDate(filterDate.value)} (${list.length})`
        : `All Appointments (${list.length})`;

    if (list.length === 0) {
        appointmentsBody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align:center; padding:20px;">
                    No appointments found
                </td>
            </tr>`;
        return;
    }

    list.forEach(app => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td data-label="Patient Name">${app.patientName}</td>
            <td data-label="Doctor Name">${app.doctorName}</td>
            <td data-label="Hospital">${app.hospitalName}</td>
            <td data-label="Specialty">${app.specialty}</td>
            <td data-label="Date">${formatDate(app.date)}</td>
            <td data-label="Time">${app.time}</td>
            <td data-label="Reason">${app.reason}</td>
            <td data-label="Actions">
                <button class="edit-btn" style="border:none;background:none;cursor:pointer;">✏️</button>
                <button class="delete-btn" style="border:none;background:none;cursor:pointer;margin-left:10px;">🗑️</button>
            </td>
        `;

        tr.querySelector(".edit-btn").onclick = () => {
            localStorage.setItem("editAppointmentId", app.id);
            window.location.href = "index.html";
        };

        tr.querySelector(".delete-btn").onclick = () => {
            if (confirm("Are you sure you want to delete this appointment?")) {
                appointments = appointments.filter(a => a.id !== app.id);
                localStorage.setItem("appointments", JSON.stringify(appointments));
                applyFilters();
            }
        };

        appointmentsBody.appendChild(tr);
    });
}

/* Apply Filters ONLY on button click */
function applyFilters() {
    let filtered = [...appointments];

    const pVal = filterPatient.value.toLowerCase().trim();
    const dVal = filterDoctor.value.toLowerCase().trim();
    const dateVal = filterDate.value;

    if (pVal) {
        filtered = filtered.filter(a =>
            a.patientName.toLowerCase().includes(pVal)
        );
    }

    if (dVal) {
        filtered = filtered.filter(a =>
            a.doctorName.toLowerCase().includes(dVal)
        );
    }

    if (dateVal) {
        filtered = filtered.filter(a => a.date === dateVal);
    }

    renderAppointments(filtered);
}

/* Update Button Click */
if (updateBtn) {
    updateBtn.onclick = applyFilters;
}

/* Back Button */
const backBtn = document.getElementById("backBtn");
if (backBtn) {
    backBtn.onclick = () => window.location.href = "index.html";
}

/* Initial Load – show all appointments */
renderAppointments(appointments);
