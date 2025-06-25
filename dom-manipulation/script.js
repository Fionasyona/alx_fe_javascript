let quotes = [];
const quoteDisplay = document.getElementById("quoteDisplay");
const syncStatus = document.getElementById("syncStatus");

function loadQuotes() {
  const savedQuotes = localStorage.getItem("quotes");
  if (savedQuotes) {
    quotes = JSON.parse(savedQuotes);
  } else {
    quotes = [
      { text: "The only limit to our realization of tomorrow is our doubts of today.", category: "Motivation" },
      { text: "In the middle of difficulty lies opportunity.", category: "Inspiration" }
    ];
    saveQuotes();
  }
}

function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

function populateCategories() {
  const dropdown = document.getElementById("categoryFilter");
  const selected = localStorage.getItem("lastCategory") || "all";
  const categories = [...new Set(quotes.map(q => q.category))];

  dropdown.innerHTML = '<option value="all">All Categories</option>';
  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    dropdown.appendChild(option);
  });

  dropdown.value = selected;
}

function showRandomQuote() {
  const selectedCategory = document.getElementById("categoryFilter").value;
  let filteredQuotes = selectedCategory === "all"
    ? quotes
    : quotes.filter(q => q.category === selectedCategory);

  if (filteredQuotes.length === 0) {
    quoteDisplay.textContent = "No quotes in this category.";
    return;
  }

  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  const quote = filteredQuotes[randomIndex];
  quoteDisplay.textContent = `"${quote.text}" — (${quote.category})`;
}

function filterQuotes() {
  const selected = document.getElementById("categoryFilter").value;
  localStorage.setItem("lastCategory", selected);
  showRandomQuote();
}

function addQuote() {
  const text = document.getElementById("newQuoteText").value.trim();
  const category = document.getElementById("newQuoteCategory").value.trim();

  if (!text || !category) {
    alert("Please enter both quote and category.");
    return;
  }

  quotes.push({ text, category });
  saveQuotes();
  populateCategories();
  alert("Quote added successfully!");
  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";
}

function exportQuotes() {
  const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  a.click();
  URL.revokeObjectURL(url);
}

function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function(e) {
    try {
      const importedQuotes = JSON.parse(e.target.result);
      if (Array.isArray(importedQuotes)) {
        quotes.push(...importedQuotes);
        saveQuotes();
        populateCategories();
        alert("Quotes imported successfully!");
      } else {
        alert("Invalid file format.");
      }
    } catch {
      alert("Failed to import quotes.");
    }
  };
  fileReader.readAsText(event.target.files[0]);
}

// 🔁 Simulated server sync (every 10 seconds)
function startServerSync() {
  setInterval(async () => {
    try {
      // Simulate fetch from mock server — replace with your own JSON endpoint if needed
      const serverQuotes = await fetchMockQuotesFromServer();

      let updated = false;

      serverQuotes.forEach(serverQuote => {
        const exists = quotes.find(local => local.text === serverQuote.text);
        if (!exists) {
          quotes.push(serverQuote);
          updated = true;
        } else if (exists.category !== serverQuote.category) {
          // Conflict: server version wins
          exists.category = serverQuote.category;
          updated = true;
        }
      });

      if (updated) {
        saveQuotes();
        populateCategories();
        showRandomQuote();
        notifySync("Quotes synced with server.");
      }

    } catch (err) {
      notifySync("Failed to sync with server.", true);
    }
  }, 10000); // every 10 seconds
}

// 🔁 Simulated fetch (could be replaced with real API call)
async function fetchMockQuotesFromServer() {
  return [
    { text: "Turn your wounds into wisdom.", category: "Healing" },
    { text: "The best way out is always through.", category: "Courage" }
  ];
}

// Show sync status
function notifySync(message, error = false) {
  syncStatus.textContent = message;
  syncStatus.style.color = error ? "red" : "green";
  setTimeout(() => syncStatus.textContent = "", 5000);
}

// Init
document.getElementById("newQuote").addEventListener("click", showRandomQuote);
loadQuotes();
populateCategories();
showRandomQuote();
startServerSync();
