document.addEventListener("DOMContentLoaded", () => {
  // Încarcă reparațiile finalizate
  function loadCompletedRepairs() {
    fetch("/api/admin/completed-repairs")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Eroare la încărcarea reparațiilor finalizate.");
        }
        return response.json();
      })
      .then((repairs) => {
        const repairsTable = document
          .getElementById("completedRepairsTable")
          .querySelector("tbody");
        repairsTable.innerHTML = ""; // Golește tabelul

        repairs.forEach((repair) => {
          const row = document.createElement("tr");
          row.innerHTML = `
              <td>${repair.id_reparatie}</td>
              <td>${repair.tip_dispozitiv} ${repair.marca_dispozitiv} (${
            repair.model_dispozitiv
          })</td>
              <td>${new Date(repair.data).toLocaleDateString()}</td>
              <td>${repair.cost_total ? `${repair.cost_total} RON` : "N/A"}</td>
            `;
          repairsTable.appendChild(row);
        });
      })
      .catch((error) => {
        console.error("Eroare la încărcarea reparațiilor finalizate:", error);
      });
  }

  // Buton Înapoi
  document.getElementById("backButton").addEventListener("click", () => {
    window.location.href = "/admin.html"; // Navighează înapoi la dashboard
  });

  // Încarcă datele când pagina este încărcată
  loadCompletedRepairs();
});
