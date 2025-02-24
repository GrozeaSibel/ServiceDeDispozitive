// Încarcă tehnicienii inactivi
function loadInactiveTechniciansForDeletion() {
  fetch("/api/admin/inactive-technicians") // Endpoint-ul pentru tehnicienii inactivi
    .then((response) => {
      if (!response.ok) {
        throw new Error("Eroare la încărcarea tehnicienilor inactivi.");
      }
      return response.json();
    })
    .then((technicians) => {
      const techniciansTable = document
        .getElementById("deleteTechniciansTable")
        .querySelector("tbody");
      techniciansTable.innerHTML = ""; // Golește tabelul

      technicians.forEach((technician) => {
        const row = document.createElement("tr");
        row.innerHTML = `
                <td>${technician.id_tehnician}</td>
                <td>${technician.nume_tehnician}</td>
                <td>${technician.prenume_tehnician}</td>
                <td>${technician.specializare}</td>
                <td>
                  <button class="delete-technician" data-id="${technician.id_tehnician}">
                    Șterge
                  </button>
                </td>
              `;
        techniciansTable.appendChild(row);
      });
    })
    .catch((error) => {
      console.error("Eroare la încărcarea tehnicienilor inactivi:", error);
      displayFeedback("Eroare la încărcarea tehnicienilor inactivi.", "red");
    });
}

// Șterge un tehnician inactiv
document.addEventListener("click", (e) => {
  if (e.target.classList.contains("delete-technician")) {
    const technicianId = e.target.getAttribute("data-id");

    if (confirm("Sigur doriți să ștergeți acest tehnician?")) {
      fetch(`/api/admin/delete-technician/${technicianId}`, {
        method: "DELETE",
      })
        .then((response) => {
          if (!response.ok) {
            return response.json().then((data) => {
              throw new Error(
                data.message || "Eroare la ștergerea tehnicianului."
              );
            });
          }
          return response.json();
        })
        .then((data) => {
          displayFeedback(data.message, "green");
          loadInactiveTechniciansForDeletion(); // Reîncarcă tabelul
        })
        .catch((error) => {
          console.error("Eroare la ștergerea tehnicianului:", error);
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
  loadInactiveTechniciansForDeletion();
});
