const menuToggle = document.querySelector(".menu-toggle");
const navigation = document.querySelector("#site-nav");

menuToggle?.addEventListener("click", () => {
  const isOpen = navigation.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
});

navigation?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    navigation.classList.remove("open");
    menuToggle?.setAttribute("aria-expanded", "false");
  });
});

const financeLoginCard = document.querySelector("#finance-login-card");
const financeLoginForm = document.querySelector("#finance-login-form");
const financeLoginStatus = document.querySelector("#finance-login-status");
const financeDashboard = document.querySelector("#finance-dashboard");
const financeUser = document.querySelector("#finance-user");
const financeLogout = document.querySelector("#finance-logout");
const financeEntryForm = document.querySelector("#finance-entry-form");
const financeEntryStatus = document.querySelector("#finance-entry-status");
const financeEntries = document.querySelector("#finance-entries");
const financeIncome = document.querySelector("#finance-income");
const financeExpenses = document.querySelector("#finance-expenses");
const financeBalance = document.querySelector("#finance-balance");
const financeDate = document.querySelector("#finance-date");
const supabaseClient = window.SUPABASE_CONFIG?.url && window.SUPABASE_CONFIG?.anonKey
  ? window.supabase.createClient(window.SUPABASE_CONFIG.url, window.SUPABASE_CONFIG.anonKey)
  : null;

const formatCurrency = (value) => value.toLocaleString("de-DE", {
  style: "currency",
  currency: "EUR",
});

function setFinanceState(session) {
  const signedIn = Boolean(session);
  financeLoginCard.hidden = signedIn;
  financeDashboard.hidden = !signedIn;
  if (signedIn) financeUser.textContent = `Angemeldet als ${session.user.email}`;
}

async function loadFinanceEntries() {
  const { data, error } = await supabaseClient
    .from("finance_entries")
    .select("id, entry_date, type, description, amount")
    .order("entry_date", { ascending: false })
    .order("created_at", { ascending: false });
  if (error) throw error;

  const totals = data.reduce((result, entry) => {
    result[entry.type] += Number(entry.amount);
    return result;
  }, { income: 0, expense: 0 });
  financeIncome.textContent = formatCurrency(totals.income);
  financeExpenses.textContent = formatCurrency(totals.expense);
  financeBalance.textContent = formatCurrency(totals.income - totals.expense);
  financeBalance.classList.toggle("negative", totals.income < totals.expense);
  financeEntries.replaceChildren(...data.map((entry) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${new Date(`${entry.entry_date}T12:00:00`).toLocaleDateString("de-DE")}</td>
      <td>${escapeHtml(entry.description)}</td>
      <td><span class="finance-type ${entry.type}">${entry.type === "income" ? "Einnahme" : "Ausgabe"}</span></td>
      <td class="${entry.type === "expense" ? "expense-value" : "income-value"}">${entry.type === "expense" ? "-" : "+"}${formatCurrency(Number(entry.amount))}</td>
      <td><button class="delete-entry" type="button" data-id="${entry.id}" aria-label="Eintrag löschen">×</button></td>`;
    return row;
  }));
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;",
  }[character]));
}

async function refreshFinance() {
  try {
    await loadFinanceEntries();
  } catch (error) {
    financeEntryStatus.textContent = `Die Finanzdaten konnten nicht geladen werden: ${error.message}`;
  }
}

financeDate.value = new Date().toISOString().slice(0, 10);

financeLoginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!supabaseClient) {
    financeLoginStatus.textContent = "Supabase ist noch nicht konfiguriert.";
    return;
  }
  financeLoginStatus.textContent = "Anmeldung läuft …";
  const formData = new FormData(financeLoginForm);
  const { error } = await supabaseClient.auth.signInWithPassword({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  financeLoginStatus.textContent = error ? `Anmeldung fehlgeschlagen: ${error.message}` : "";
});

financeLogout.addEventListener("click", async () => {
  const { error } = await supabaseClient.auth.signOut();
  if (error) financeEntryStatus.textContent = `Abmeldung fehlgeschlagen: ${error.message}`;
});

financeEntryForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(financeEntryForm);
  const amount = Number(formData.get("amount"));
  if (!Number.isFinite(amount) || amount <= 0) {
    financeEntryStatus.textContent = "Bitte einen gültigen Betrag eingeben.";
    return;
  }
  const { error } = await supabaseClient.from("finance_entries").insert({
    entry_date: formData.get("date"),
    type: formData.get("type"),
    description: formData.get("description"),
    amount,
  });
  if (error) {
    financeEntryStatus.textContent = `Der Eintrag konnte nicht gespeichert werden: ${error.message}`;
    return;
  }
  financeEntryForm.reset();
  financeDate.value = new Date().toISOString().slice(0, 10);
  financeEntryStatus.textContent = "Eintrag gespeichert.";
  await refreshFinance();
});

financeEntries.addEventListener("click", async (event) => {
  const button = event.target.closest(".delete-entry");
  if (!button) return;
  const { error } = await supabaseClient.from("finance_entries").delete().eq("id", button.dataset.id);
  if (error) {
    financeEntryStatus.textContent = `Der Eintrag konnte nicht gelöscht werden: ${error.message}`;
    return;
  }
  await refreshFinance();
});

if (supabaseClient) {
  supabaseClient.auth.onAuthStateChange((_event, session) => {
    setFinanceState(session);
    if (session) refreshFinance();
  });
  supabaseClient.auth.getSession().then(({ data, error }) => {
    if (error) {
      financeLoginStatus.textContent = `Authentifizierung fehlgeschlagen: ${error.message}`;
      return;
    }
    setFinanceState(data.session);
    if (data.session) refreshFinance();
  });
} else {
  setFinanceState(null);
}
