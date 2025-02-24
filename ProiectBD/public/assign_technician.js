// Populează lista de reparații cu statusul "în așteptare"
function loadPendingRepairs() {
  fetch("/api/admin/pending-repairs")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Eroare la încărcarea reparațiilor.");
      }
      return response.json();
    })
    .then((repairs) => {
      const repairSelect = document.getElementById("repairId");
      repairSelect.innerHTML = ""; // Resetează lista

      repairs.forEach((repair) => {
        const option = document.createElement("option");
        option.value = repair.id_reparatie;
        option.textContent = `#${repair.id_reparatie} - ${repair.tip_dispozitiv} ${repair.marca} (${repair.data})`;
        repairSelect.appendChild(option);
      });
    })
    .catch((error) => {
      console.error("Eroare la încărcarea reparațiilor:", error);
      displayFeedback("Eroare la încărcarea reparațiilor.", "red");
    });
}

// Populează lista de tehnicieni
function loadTechnicians() {
  fetch("/api/admin/technicians")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Eroare la încărcarea tehnicienilor.");
      }
      return response.json();
    })
    .then((technicians) => {
      const technicianSelect = document.getElementById("technicianId");
      technicianSelect.innerHTML = ""; // Resetează lista

      technicians.forEach((technician) => {
        const option = document.createElement("option");
        option.value = technician.id_tehnician;
        option.textContent = `${technician.nume_tehnician} ${technician.prenume_tehnician} (${technician.specializare})`;
        technicianSelect.appendChild(option);
      });
    })
    .catch((error) => {
      console.error("Eroare la încărcarea tehnicienilor:", error);
      displayFeedback("Eroare la încărcarea tehnicienilor.", "red");
    });
}

// Trimiterea datelor către API
document
  .getElementById("assignTechnicianForm")
  .addEventListener("submit", (e) => {
    e.preventDefault();

    const repairId = document.getElementById("repairId").value;
    const technicianId = document.getElementById("technicianId").value;

    fetch("/api/admin/assign-technician", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id_reparatie: repairId,
        id_tehnician: technicianId,
      }),
    })
      .then((response) => {
        if (!response.ok) {
          return response.json().then((data) => {
            throw new Error(data.message || "Eroare la asignare.");
          });
        }
        return response.json();
      })
      .then((data) => {
        displayFeedback(data.message, "green");
        loadPendingRepairs(); // Reîncarcă lista de reparații
        loadRepairsWithServices(); // Reîncarcă tabelul cu servicii necesare
      })
      .catch((error) => {
        console.error("Eroare la asignare:", error);
        displayFeedback(error.message, "red");
      });
  });

// Încarcă reparațiile cu serviciile necesare
function loadRepairsWithServices() {
  fetch("/api/admin/repairs-with-services")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Eroare la încărcarea reparațiilor.");
      }
      return response.json();
    })
    .then((repairs) => {
      const repairsTable = document
        .getElementById("repairsTable")
        .querySelector("tbody");
      repairsTable.innerHTML = ""; // Golește tabelul

      repairs.forEach((repair) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${repair.id_reparatie}</td>
            <td>${repair.tip_dispozitiv} ${repair.marca_dispozitiv} (${
          repair.model_dispozitiv
        })</td>
            <td>${repair.status}</td>
            <td>${
              repair.servicii_necesare || "Nicio informație disponibilă"
            }</td>
          `;
        repairsTable.appendChild(row);
      });
    })
    .catch((error) => {
      console.error("Eroare la încărcarea reparațiilor cu servicii:", error);
      displayFeedback("Eroare la încărcarea reparațiilor.", "red");
    });
}

// Afișează mesaje de feedback
function displayFeedback(message, color) {
  const feedback = document.getElementById("feedback");
  feedback.textContent = message;
  feedback.style.color = color;
  feedback.style.opacity = "1"; // Asigură că feedback-ul este vizibil
  feedback.style.transition = "opacity 0.5s ease"; // Adaugă tranziție lină

  // Ascunde mesajul după 3 secunde
  setTimeout(() => {
    feedback.style.opacity = "0"; // Fadeaway
  }, 3000);
}

// Eveniment pentru butonul "Înapoi"
document.getElementById("backButton").addEventListener("click", () => {
  window.location.href = "/admin.html"; // Redirecționează către dashboard-ul administratorului
});

// Inițializare
document.addEventListener("DOMContentLoaded", () => {
  loadPendingRepairs();
  loadTechnicians();
  loadRepairsWithServices(); // Asigură că și tabelul este încărcat inițial
});
