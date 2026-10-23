const eventTypeSelect = document.getElementById("event-type");
const photoBoothOptions = document.getElementById("photo-booth-options");
const eventTypeGroup = eventTypeSelect.closest(".event-type-group");
const pricingText = document.getElementById("event-pricing-text");
const changePhotoOptionButton = document.getElementById("change-photo-option");
const blankCalendar = document.getElementById("blank-calendar");
const bookingCalendar = document.getElementById("booking-calendar");
const monthLabel = document.getElementById("calendar-month-label");
const calendarDays = document.getElementById("calendar-days");
const calendarInstructions = document.getElementById("calendar-instructions");

const calendarUrls = {
  wedding: "https://cal.com/wildmanshow-booking/wedding?embed=true",
  party: "https://cal.com/wildmanshow-booking/party?embed=true",
  karaoke: "https://cal.com/wildmanshow-booking/karaoke?embed=true",
  photoBooth: {
    digital: "https://cal.com/wildmanshow-booking/photo-booth-digital?embed=true",
    printing: "https://cal.com/wildmanshow-booking/photo-booth-prints?embed=true"
  }
};

const eventPricing = {
  wedding: "<strong>Wedding:</strong> $900 for 5 hours.",
  party: "<strong>Party:</strong> Starting at $450 for a 3-hour minimum. Additional hours are $150 per hour.",
  karaoke: "<strong>Karaoke:</strong> $350 for 4 hours."
};

let photoBoothFormat = "";
let displayedMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
let selectedDate = null;
let selectedEventType = "";

function renderCalendarMonth() {
  const year = displayedMonth.getFullYear();
  const month = displayedMonth.getMonth();
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();

  monthLabel.textContent = displayedMonth.toLocaleDateString(undefined, {
    month: "long",
    year: "numeric"
  });

  const weeks = [];
  let day = 1 - firstWeekday;
  while (day <= daysInMonth) {
    const week = document.createElement("tr");
    for (let weekday = 0; weekday < 7; weekday += 1, day += 1) {
      const cell = document.createElement("td");
      if (day > 0 && day <= daysInMonth) {
        const date = new Date(year, month, day);
        const dateButton = document.createElement("button");
        const dateString = [
          year,
          String(month + 1).padStart(2, "0"),
          String(day).padStart(2, "0")
        ].join("-");
        const isToday =
          year === today.getFullYear() &&
          month === today.getMonth() &&
          day === today.getDate();

        dateButton.type = "button";
        dateButton.className = "calendar-day";
        dateButton.textContent = String(day);
        dateButton.setAttribute("aria-label", date.toLocaleDateString(undefined, {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric"
        }));
        dateButton.disabled = date < new Date(today.getFullYear(), today.getMonth(), today.getDate());
        if (isToday) dateButton.classList.add("is-today");
        if (dateString === selectedDate) dateButton.classList.add("is-selected");
        dateButton.addEventListener("click", () => selectBookingDate(dateString));

        if (isToday) {
          dateButton.setAttribute("aria-current", "date");
        }
        cell.appendChild(dateButton);
      }
      week.appendChild(cell);
    }
    weeks.push(week);
  }

  calendarDays.replaceChildren(...weeks);
}

function selectBookingDate(date) {
  if (!selectedEventType) {
    calendarInstructions.textContent = "Select an event before choosing a date.";
    return;
  }

  selectedDate = date;
  renderCalendarMonth();

  const eventUrl = selectedEventType === "photo-booth"
    ? calendarUrls.photoBooth[photoBoothFormat]
    : calendarUrls[selectedEventType];

  if (!eventUrl) {
    calendarInstructions.textContent = "Choose Digital or Printing before choosing a date.";
    return;
  }

  const url = new URL(eventUrl);
  url.searchParams.set("date", date);
  showBookingCalendar(url.toString());
  calendarInstructions.textContent = `Choose an available time for ${new Date(`${date}T12:00:00`).toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric"
  })}. Cal.com will show the booking details after you select a time.`;
}

function showBookingCalendar(url) {
  blankCalendar.hidden = true;
  bookingCalendar.hidden = false;
  bookingCalendar.src = url;
}

function showBlankCalendar() {
  bookingCalendar.removeAttribute("src");
  bookingCalendar.hidden = true;
  blankCalendar.hidden = false;
}

eventTypeSelect.addEventListener("change", () => {
  const eventType = eventTypeSelect.value;
  photoBoothFormat = "";
  selectedEventType = eventType;
  selectedDate = null;
  renderCalendarMonth();
  photoBoothOptions.hidden = eventType !== "photo-booth";
  eventTypeGroup.classList.toggle("has-photo-options", eventType === "photo-booth");
  changePhotoOptionButton.hidden = true;
  pricingText.hidden = eventType === "photo-booth";

  if (eventType === "photo-booth") {
    calendarInstructions.textContent = "Choose Digital or Printing, then select a date.";
    showBlankCalendar();
    return;
  }

  if (!eventType) {
    pricingText.textContent = "Select an event to view pricing.";
    calendarInstructions.textContent = "Select an event to view its calendar.";
    showBlankCalendar();
    return;
  }

  pricingText.innerHTML = eventPricing[eventType];
  calendarInstructions.textContent = "Select a date to view its available times.";
  showBlankCalendar();
});

photoBoothOptions.addEventListener("click", (event) => {
  const button = event.target.closest("[data-photo-option]");
  if (!button) return;

  photoBoothFormat = button.dataset.photoOption;
  const isDigital = photoBoothFormat === "digital";
  const format = isDigital ? "Digital" : "Printing";
  const price = isDigital ? "$450" : "$550";

  pricingText.innerHTML = `<strong>Photo Booth — ${format}:</strong> ${price} for 3 hours.`;
  pricingText.hidden = false;
  photoBoothOptions.hidden = true;
  eventTypeGroup.classList.remove("has-photo-options");
  changePhotoOptionButton.hidden = false;
  selectedDate = null;
  renderCalendarMonth();
  calendarInstructions.textContent = "Select a date to view its available times.";
  showBlankCalendar();
});

changePhotoOptionButton.addEventListener("click", () => {
  pricingText.hidden = true;
  photoBoothOptions.hidden = false;
  eventTypeGroup.classList.add("has-photo-options");
  changePhotoOptionButton.hidden = true;
});

document.getElementById("previous-month").addEventListener("click", () => {
  displayedMonth = new Date(displayedMonth.getFullYear(), displayedMonth.getMonth() - 1, 1);
  renderCalendarMonth();
});

document.getElementById("next-month").addEventListener("click", () => {
  displayedMonth = new Date(displayedMonth.getFullYear(), displayedMonth.getMonth() + 1, 1);
  renderCalendarMonth();
});

renderCalendarMonth();
