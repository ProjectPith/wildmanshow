const eventTypeSelect = document.getElementById("event-type");
const photoBoothOptions = document.getElementById("photo-booth-options");
const eventTypeGroup = eventTypeSelect.closest(".event-type-group");
const pricingText = document.getElementById("event-pricing-text");
const changePhotoOptionButton = document.getElementById("change-photo-option");
const blankCalendar = document.getElementById("blank-calendar");
const bookingCalendar = document.getElementById("booking-calendar");
const monthLabel = document.getElementById("calendar-month-label");
const calendarDays = document.getElementById("calendar-days");

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
        cell.textContent = String(day);
        if (
          year === today.getFullYear() &&
          month === today.getMonth() &&
          day === today.getDate()
        ) {
          cell.classList.add("is-today");
          cell.setAttribute("aria-label", `${day}, today`);
        }
      }
      week.appendChild(cell);
    }
    weeks.push(week);
  }

  calendarDays.replaceChildren(...weeks);
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
  photoBoothOptions.hidden = eventType !== "photo-booth";
  eventTypeGroup.classList.toggle("has-photo-options", eventType === "photo-booth");
  changePhotoOptionButton.hidden = true;
  pricingText.hidden = eventType === "photo-booth";

  if (eventType === "photo-booth") {
    showBlankCalendar();
    return;
  }

  if (!eventType) {
    pricingText.textContent = "Select an event to view pricing.";
    showBlankCalendar();
    return;
  }

  pricingText.innerHTML = eventPricing[eventType];
  showBookingCalendar(calendarUrls[eventType]);
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
  showBookingCalendar(calendarUrls.photoBooth[photoBoothFormat]);
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
