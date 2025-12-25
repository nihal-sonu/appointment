// ====== ELEMENTS ======
const monthYearEl = document.getElementById("monthYear");
const calendarGrid = document.getElementById("calendarGrid");
const prevBtn = document.getElementById("prevMonth");
const nextBtn = document.getElementById("nextMonth");
const todayBtn = document.getElementById("todayBtn");
const modal = document.getElementById("appointmentModal");
const openModalBtn = document.getElementById("openModalBtn");
const closeModalBtn = document.getElementById("closeModalBtn");
const appointmentForm = document.getElementById("appointmentForm");
const menuBtn = document.getElementById("menuBtn");
const sidebar = document.getElementById("sidebar");
const mainContent = document.getElementById("mainContent");

const navItems = document.querySelectorAll(".nav-item");
const calendarSection = document.querySelector(".calendar-box");
const dashboardSection = document.createElement("div");
dashboardSection.className = "dashboard-section";
dashboardSection.style.display = "none";
mainContent.appendChild(dashboardSection);

let currentDate = new Date();
const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];

// ====== RENDER CALENDAR ======
function renderCalendar() {
  calendarGrid.innerHTML = "";

  ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].forEach(day => {
    const d = document.createElement("div");
    d.className = "day";
    d.textContent = day;
    calendarGrid.appendChild(d);
  });

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  monthYearEl.textContent = `${months[month]} ${year}`;

  const firstDay = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();

  for (let i = 0; i < firstDay; i++) {
    const emptyCell = document.createElement("div");
    emptyCell.className = "date-cell empty";
    calendarGrid.appendChild(emptyCell);
  }

  for (let day = 1; day <= totalDays; day++) {
    const cell = document.createElement("div");
    cell.className = "date-cell";

    const number = document.createElement("div");
    number.className = "date-number";
    number.textContent = day;

    const appointmentsContainer = document.createElement("div");
    appointmentsContainer.className = "appointments-container";

    cell.appendChild(number);
    cell.appendChild(appointmentsContainer);
    calendarGrid.appendChild(cell);

    // Highlight today
    const today = new Date();
    if (day === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
      cell.classList.add("today-highlight");
    }

    const formattedDate = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    cell.onclick = (e) => {
      if (e.target.classList.contains('date-cell') || e.target.classList.contains('date-number')) {
        document.getElementById("appointmentDate").value = formattedDate;
        appointmentForm.reset();
        document.getElementById("appointmentDate").value = formattedDate;
        localStorage.removeItem("editAppointmentId");
        modal.style.display = "block";
      }
    };
  }

  renderAppointmentsOnCalendar();
}

// ====== NAVIGATION ======
prevBtn.onclick = () => { currentDate.setMonth(currentDate.getMonth() - 1); renderCalendar(); };
nextBtn.onclick = () => { currentDate.setMonth(currentDate.getMonth() + 1); renderCalendar(); };
todayBtn.onclick = () => { currentDate = new Date(); renderCalendar(); };

// ====== MENU ======
menuBtn.onclick = () => sidebar.classList.toggle("open");

// ====== MODAL ======
openModalBtn.onclick = () => {
  appointmentForm.reset();
  localStorage.removeItem("editAppointmentId");
  modal.style.display = "block";
};
closeModalBtn.onclick = () => modal.style.display = "none";
window.onclick = (e) => { if (e.target === modal) modal.style.display = "none"; };

// ====== SAVE / EDIT APPOINTMENT ======
appointmentForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const editId = localStorage.getItem("editAppointmentId");
  let appointments = JSON.parse(localStorage.getItem("appointments")) || [];

  const appointmentData = {
    patientName: document.getElementById("patientName").value,
    doctorName: document.getElementById("doctorName").value,
    hospitalName: document.getElementById("hospitalName").value,
    specialty: document.getElementById("specialty").value,
    date: document.getElementById("appointmentDate").value,
    time: document.getElementById("appointmentTime").value,
    reason: document.getElementById("reason").value
  };

  if (editId) {
    appointments = appointments.map(a => a.id == editId ? { ...appointmentData, id: a.id } : a);
    localStorage.removeItem("editAppointmentId");
  } else {
    appointmentData.id = Date.now();
    appointments.push(appointmentData);
  }

  localStorage.setItem("appointments", JSON.stringify(appointments));
  modal.style.display = "none";
  renderCalendar();
});

// ====== RENDER APPOINTMENTS ON CALENDAR ======
function renderAppointmentsOnCalendar() {
  const appointments = JSON.parse(localStorage.getItem("appointments")) || [];
  const cells = document.querySelectorAll(".date-cell:not(.empty)");

  cells.forEach(cell => {
    const day = cell.querySelector(".date-number").textContent;
    const container = cell.querySelector(".appointments-container");
    container.innerHTML = "";

    const cellDate = `${currentDate.getFullYear()}-${String(currentDate.getMonth()+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
    const cellAppointments = appointments.filter(app => app.date === cellDate);

    cellAppointments.forEach(app => {
      const tag = document.createElement("div");
      tag.className = "appointment-tag";
      tag.innerHTML = `<span>${app.time} ${app.patientName}</span>`;

      // Edit Button
      const editBtn = document.createElement("button");
      editBtn.textContent = "✏️";
      editBtn.onclick = (e) => {
        e.stopPropagation();
        localStorage.setItem("editAppointmentId", app.id);
        Object.keys(app).forEach(key => {
          const el = document.getElementById(key);
          if (el) el.value = app[key];
        });
        modal.style.display = "block";
      };

      // Delete Button
      const delBtn = document.createElement("button");
      delBtn.textContent = "🗑️";
      delBtn.onclick = (e) => {
        e.stopPropagation();
        if(confirm("Delete this appointment?")) {
          const filtered = appointments.filter(a => a.id !== app.id);
          localStorage.setItem("appointments", JSON.stringify(filtered));
          renderCalendar();
        }
      };

      tag.appendChild(editBtn);
      tag.appendChild(delBtn);
      container.appendChild(tag);
    });
  });
}

// ====== DASHBOARD / APPOINTMENTS ======
navItems[1].addEventListener("click", () => {
    calendarSection.style.display = "none";
    dashboardSection.style.display = "block";
    navItems[1].classList.add("active");
    navItems[0].classList.remove("active");

    fetch("appointment.html")
        .then(res => res.text())
        .then(html => {
            dashboardSection.innerHTML = html;

            // Dynamically load appointment.js after HTML is injected
            const script = document.createElement("script");
            script.src = "appointment.js";
            document.body.appendChild(script);
        });
});

// Calendar tab click
navItems[0].addEventListener("click", () => {
    dashboardSection.style.display = "none";
    calendarSection.style.display = "block";
    navItems[0].classList.add("active");
    navItems[1].classList.remove("active");
});

// ====== INITIAL ======
renderCalendar();
