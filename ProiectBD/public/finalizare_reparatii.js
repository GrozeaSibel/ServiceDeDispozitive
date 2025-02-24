// Încarcă reparațiile cu statusul "In lucru"
function loadRepairsInProgress() {
  fetch("/api/admin/repairs-in-progress")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Eroare la încărcarea reparațiilor 'In lucru'.");
      }
      return response.json();
    })
    .then((repairs) => {
      const repairsTable = document
        .getElementById("finalizeRepairsTable")
        .querySelector("tbody");
      repairsTable.innerHTML = ""; // Golește tabelul

      repairs.forEach((repair) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${repair.id_reparatie}</td>
            <td>${repair.tip_dispozitiv} ${repair.marca_dispozitiv} (${repair.model_dispozitiv})</td>
            <td>${repair.status}</td>
            <td>
              <button class="finalize-repair" data-id="${repair.id_reparatie}">
                Finalizează
              </button>
            </td>
          `;
        repairsTable.appendChild(row);
      });
    })
    .catch((error) => {
      console.error("Eroare la încărcarea reparațiilor:", error);
      displayFeedback("Eroare la încărcarea reparațiilor.", "red");
    });
}

// Finalizează o reparație
document.addEventListener("click", (e) => {
  if (e.target.classList.contains("finalize-repair")) {
    const repairId = e.target.getAttribute("data-id");

    fetch("/api/admin/finalize-repair", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id_reparatie: repairId }),
    })
      .then((response) => {
        if (!response.ok) {
          return response.json().then((data) => {
            throw new Error(
              data.message || "Eroare la finalizarea reparației."
            );
          });
        }
        return response.json();
      })
      .then((data) => {
        displayFeedback(data.message, "green");
        loadRepairsInProgress(); // Reîncarcă tabelul
      })
      .catch((error) => {
        console.error("Eroare la finalizarea reparației:", error);
        displayFeedback(error.message, "red");
      });
  }
});

// Afișează mesaje de feedback
function displayFeedback(message, color) {
  const feedback = document.getElementById("feedback");
  feedback.textContent = message;
  feedback.style.color = color;
  feedback.style.opacity = "1"; // Asigură că feedback-ul este vizibil
  feedback.style.transition = "opacity 0.5s ease";

  // Ascunde mesajul după 3 secunde
  setTimeout(() => {
    feedback.style.opacity = "0";
  }, 3000);
}

// Eveniment pentru butonul "Înapoi"
document.getElementById("backButton").addEventListener("click", () => {
  window.location.href = "/admin.html"; // Redirecționează către pagina admin
});

// Inițializare
document.addEventListener("DOMContentLoaded", () => {
  loadRepairsInProgress();
});
