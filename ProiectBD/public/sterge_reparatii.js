// Încarcă reparațiile care pot fi șterse (status "In asteptare")
function loadPendingRepairsForDeletion() {
  fetch("/api/admin/pending-repairs") // Endpoint-ul pentru reparații "In asteptare"
    .then((response) => {
      if (!response.ok) {
        throw new Error("Eroare la încărcarea reparațiilor.");
      }
      return response.json();
    })
    .then((repairs) => {
      const repairsTable = document
        .getElementById("deleteRepairsTable")
        .querySelector("tbody");
      repairsTable.innerHTML = ""; // Golește tabelul

      repairs.forEach((repair) => {
        const row = document.createElement("tr");
        row.innerHTML = `
              <td>${repair.id_reparatie}</td>
              <td>${repair.tip_dispozitiv} ${repair.marca} (${repair.model})</td>
              <td>${repair.status}</td>
              <td>
                <button class="delete-repair" data-id="${repair.id_reparatie}">
                  Șterge
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

// Șterge o reparație
document.addEventListener("click", (e) => {
  if (e.target.classList.contains("delete-repair")) {
    const repairId = e.target.getAttribute("data-id");

    if (confirm("Sigur doriți să ștergeți această reparație?")) {
      fetch(`/api/admin/delete-repair/${repairId}`, {
        method: "DELETE",
      })
        .then((response) => {
          if (!response.ok) {
            return response.json().then((data) => {
              throw new Error(
                data.message || "Eroare la ștergerea reparației."
              );
            });
          }
          return response.json();
        })
        .then((data) => {
          displayFeedback(data.message, "green");
          loadPendingRepairsForDeletion(); // Reîncarcă tabelul
        })
        .catch((error) => {
          console.error("Eroare la ștergerea reparației:", error);
          displayFeedback(error.message, "red");
        });
    }
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
  loadPendingRepairsForDeletion();
});
