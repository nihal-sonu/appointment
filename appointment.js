function initDashboardAppointments() {
  const appointmentsBody = document.getElementById("appointmentsBody");
  const filterPatient = document.getElementById("filterPatient");
  const filterDoctor = document.getElementById("filterDoctor");
  const filterDate = document.getElementById("filterDate");
  const heading = document.getElementById("selectedDateHeading");
  const updateBtn = document.getElementById("updateBtn");
  const backBtn = document.getElementById("backBtn");

  function formatDate(dateStr) {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { day:"2-digit", month:"short", year:"numeric" });
  }

  function renderDashboardAppointments() {
    let appointments = JSON.parse(localStorage.getItem("appointments")) || [];

    const pVal = filterPatient?.value.toLowerCase().trim();
    const dVal = filterDoctor?.value.toLowerCase().trim();
    const dateVal = filterDate?.value;

    if (pVal) appointments = appointments.filter(a => a.patientName.toLowerCase().includes(pVal));
    if (dVal) appointments = appointments.filter(a => a.doctorName.toLowerCase().includes(dVal));
    if (dateVal) appointments = appointments.filter(a => a.date === dateVal);

    heading.textContent = dateVal
      ? `Appointments on ${formatDate(dateVal)} (${appointments.length})`
      : `All Appointments (${appointments.length})`;

    appointmentsBody.innerHTML = "";
    if (appointments.length === 0) {
      appointmentsBody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding:20px;">No appointments found</td></tr>`;
      return;
    }

    appointments.forEach(app => {
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
        // Switch to calendar tab
        document.querySelectorAll(".nav-item")[0].click();
        const modal = document.getElementById("appointmentModal");
        Object.keys(app).forEach(key => {
          const el = document.getElementById(key);
          if (el) el.value = app[key];
        });
        modal.style.display = "block";
      };

      tr.querySelector(".delete-btn").onclick = () => {
        if(confirm("Delete this appointment?")) {
          let allAppointments = JSON.parse(localStorage.getItem("appointments")) || [];
          allAppointments = allAppointments.filter(a => a.id !== app.id);
          localStorage.setItem("appointments", JSON.stringify(allAppointments));
          renderDashboardAppointments();
          if (typeof renderCalendar === "function") renderCalendar();
        }
      };

      appointmentsBody.appendChild(tr);
    });
  }

  if (updateBtn) updateBtn.onclick = renderDashboardAppointments;
  if (backBtn) backBtn.onclick = () => document.querySelectorAll(".nav-item")[0].click();

  renderDashboardAppointments();
}
