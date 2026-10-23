const eventTypeSelect = document.getElementById("event-type");
const eventTypeTrigger = document.getElementById("event-type-trigger");
const eventTypeMenu = document.getElementById("event-type-menu");
const eventTypeValue = document.getElementById("event-type-value");
const photoBoothOptions = document.getElementById("photo-booth-options");
const eventTypeGroup = eventTypeSelect.closest(".event-type-group");
const pricingText = document.getElementById("event-pricing-text");
const changePhotoOptionButton = document.getElementById("change-photo-option");
const calendarContainer = document.getElementById("calendar-container");
const calendarStage = document.getElementById("calendar-stage");
const calendarStatus = document.getElementById("calendar-status");
const bookingCalendar = document.getElementById("booking-calendar");
const backToCalendarButton = document.getElementById("back-to-calendar");
const backToTimesButton = document.getElementById("back-to-times");
const monthLabel = document.getElementById("calendar-month-label");
const calendarDays = document.getElementById("calendar-days");
const timesStage = document.getElementById("times-stage");
const timesDateLabel = document.getElementById("times-date-label");
const timeOptions = document.getElementById("time-options");
const timesStatus = document.getElementById("times-status");
const confirmationStage = document.getElementById("confirmation-stage");

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
let selectedDate = "";
let activeBookingUrl = "";
let availabilityByDate = new Map();
let availabilityFetched = false;

function closeEventTypeMenu() {
  eventTypeMenu.hidden = true;
  eventTypeTrigger.setAttribute("aria-expanded", "false");
  eventTypeGroup.classList.remove("has-event-menu");
}

eventTypeTrigger.addEventListener("click", () => {
  const isOpening = eventTypeMenu.hidden;
  eventTypeMenu.hidden = !isOpening;
  eventTypeTrigger.setAttribute("aria-expanded", String(isOpening));
  eventTypeGroup.classList.toggle("has-event-menu", isOpening);
});

eventTypeMenu.addEventListener("click", (event) => {
  const option = event.target.closest("[data-event-type]");
  if (!option) return;

  eventTypeSelect.value = option.dataset.eventType;
  eventTypeValue.textContent = option.textContent;
  eventTypeMenu.querySelectorAll("[role='option']").forEach((item) => {
    item.setAttribute("aria-selected", String(item === option));
  });
  closeEventTypeMenu();
  eventTypeSelect.dispatchEvent(new Event("change", { bubbles: true }));
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape" || eventTypeMenu.hidden) return;
  closeEventTypeMenu();
  eventTypeTrigger.focus();
});

document.addEventListener("click", (event) => {
  if (!eventTypeGroup.contains(event.target)) closeEventTypeMenu();
});

function formatDate(date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0")
  ].join("-");
}

function setStage(stage) {
  calendarStage.hidden = stage !== "calendar";
  timesStage.hidden = stage !== "times";
  confirmationStage.hidden = stage !== "confirmation";
  backToCalendarButton.hidden = stage !== "times";
  backToTimesButton.hidden = stage !== "confirmation";
  bookingCalendar.classList.toggle("is-availability-source", stage !== "confirmation");
  calendarContainer.dataset.stage = stage;
}

function renderCalendarMonth() {
  const year = displayedMonth.getFullYear();
  const month = displayedMonth.getMonth();
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());

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
        const dateString = formatDate(date);
        const slots = availabilityByDate.get(dateString) || [];
        const isAvailable = slots.length > 0;
        const isToday =
          year === today.getFullYear() &&
          month === today.getMonth() &&
          day === today.getDate();
        const dateButton = document.createElement("button");

        dateButton.type = "button";
        dateButton.className = "calendar-day";
        dateButton.textContent = String(day);
        dateButton.setAttribute("aria-label", date.toLocaleDateString(undefined, {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric"
        }));
        dateButton.disabled = !activeBookingUrl || !isAvailable || date < todayStart;
        if (isToday) {
          dateButton.classList.add("is-today");
          dateButton.setAttribute("aria-current", "date");
        }
        if (isAvailable) dateButton.classList.add("is-available");
        if (dateString === selectedDate) dateButton.classList.add("is-selected");
        dateButton.addEventListener("click", () => showAvailableTimes(dateString));
        cell.appendChild(dateButton);
      }
      week.appendChild(cell);
    }
    weeks.push(week);
  }

  calendarDays.replaceChildren(...weeks);
  updateCalendarStatus();
}

function updateCalendarStatus() {
  if (!activeBookingUrl) {
    calendarStatus.hidden = true;
    return;
  }

  const monthPrefix = `${formatDate(displayedMonth).slice(0, 7)}-`;
  const hasAvailableDates = [...availabilityByDate.entries()].some(
    ([date, slots]) => date.startsWith(monthPrefix) && slots.length > 0
  );

  if (hasAvailableDates) {
    calendarStatus.hidden = true;
    return;
  }

  calendarStatus.textContent = availabilityFetched
    ? "No available dates in this month."
    : "Loading available dates…";
  calendarStatus.hidden = false;
}

function loadAvailabilityForDisplayedMonth() {
  if (!activeBookingUrl) return;

  availabilityFetched = false;
  const url = new URL(activeBookingUrl);
  url.searchParams.set("date", formatDate(displayedMonth));
  bookingCalendar.src = url.toString();
  updateCalendarStatus();
}

function handleCalMessage(event) {
  if (
    event.origin !== "https://cal.com" ||
    event.source !== bookingCalendar.contentWindow ||
    !activeBookingUrl
  ) return;

  const message = event.data;
  if (message?.originator !== "CAL" || message.type !== "slotsFetched") return;
  if (!message.data?.slots || typeof message.data.slots !== "object") return;
  const expectedSlug = new URL(activeBookingUrl).pathname.split("/").pop();
  if (message.data.eventSlug !== expectedSlug) return;

  for (const [date, slots] of Object.entries(message.data.slots)) {
    if (Array.isArray(slots)) availabilityByDate.set(date, slots);
  }

  availabilityFetched = true;
  renderCalendarMonth();
  if (selectedDate && !timesStage.hidden) renderTimeOptions();
}

function showAvailableTimes(date) {
  selectedDate = date;
  timesDateLabel.textContent = new Date(`${date}T12:00:00`).toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric"
  });
  renderTimeOptions();
  setStage("times");
}

function renderTimeOptions() {
  const slots = availabilityByDate.get(selectedDate) || [];
  timeOptions.replaceChildren();

  if (!slots.length) {
    timesStatus.textContent = "No available times for this date.";
    timesStatus.hidden = false;
    return;
  }

  timesStatus.hidden = true;
  for (const slot of slots) {
    if (typeof slot.start !== "string") continue;

    const start = new Date(slot.start);
    if (Number.isNaN(start.getTime())) continue;
    const button = document.createElement("button");
    button.type = "button";
    button.className = "time-option";
    button.textContent = start.toLocaleTimeString(undefined, {
      hour: "numeric",
      minute: "2-digit"
    });
    button.addEventListener("click", () => showCalBookingDetails(slot.start));
    timeOptions.appendChild(button);
  }

  if (!timeOptions.childElementCount) {
    timesStatus.textContent = "Available times could not be loaded for this date.";
    timesStatus.hidden = false;
  }
}

function showCalBookingDetails(slotStart) {
  const url = new URL(activeBookingUrl);
  url.searchParams.set("date", selectedDate);
  url.searchParams.set("slot", slotStart);
  setStage("confirmation");
  bookingCalendar.src = url.toString();
}

function showCalendarForEvent(url) {
  activeBookingUrl = url;
  availabilityByDate = new Map();
  availabilityFetched = false;
  selectedDate = "";
  setStage("calendar");
  renderCalendarMonth();
  loadAvailabilityForDisplayedMonth();
}

eventTypeSelect.addEventListener("change", () => {
  const eventType = eventTypeSelect.value;
  const selectedOption = eventTypeSelect.selectedOptions[0];
  eventTypeValue.textContent = selectedOption?.textContent || "Select an event";
  eventTypeMenu.querySelectorAll("[role='option']").forEach((option) => {
    option.setAttribute("aria-selected", String(option.dataset.eventType === eventType));
  });
  photoBoothFormat = "";
  activeBookingUrl = "";
  availabilityByDate = new Map();
  availabilityFetched = false;
  selectedDate = "";
  photoBoothOptions.hidden = eventType !== "photo-booth";
  eventTypeGroup.classList.toggle("has-photo-options", eventType === "photo-booth");
  changePhotoOptionButton.hidden = true;
  pricingText.hidden = eventType === "photo-booth";
  setStage("calendar");

  if (eventType === "photo-booth") {
    bookingCalendar.removeAttribute("src");
    renderCalendarMonth();
    return;
  }

  if (!eventType) {
    bookingCalendar.removeAttribute("src");
    pricingText.textContent = "Select an event to view pricing.";
    renderCalendarMonth();
    return;
  }

  pricingText.innerHTML = eventPricing[eventType];
  showCalendarForEvent(calendarUrls[eventType]);
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
  showCalendarForEvent(calendarUrls.photoBooth[photoBoothFormat]);
});

changePhotoOptionButton.addEventListener("click", () => {
  pricingText.hidden = true;
  photoBoothOptions.hidden = false;
  eventTypeGroup.classList.add("has-photo-options");
  changePhotoOptionButton.hidden = true;
});

document.getElementById("previous-month").addEventListener("click", () => {
  displayedMonth = new Date(displayedMonth.getFullYear(), displayedMonth.getMonth() - 1, 1);
  selectedDate = "";
  setStage("calendar");
  renderCalendarMonth();
  loadAvailabilityForDisplayedMonth();
});

document.getElementById("next-month").addEventListener("click", () => {
  displayedMonth = new Date(displayedMonth.getFullYear(), displayedMonth.getMonth() + 1, 1);
  selectedDate = "";
  setStage("calendar");
  renderCalendarMonth();
  loadAvailabilityForDisplayedMonth();
});

backToCalendarButton.addEventListener("click", () => {
  selectedDate = "";
  setStage("calendar");
  renderCalendarMonth();
});

backToTimesButton.addEventListener("click", () => {
  setStage("times");
  renderTimeOptions();
});

window.addEventListener("message", handleCalMessage);
setStage("calendar");
renderCalendarMonth();
