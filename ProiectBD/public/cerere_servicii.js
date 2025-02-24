// Funcție pentru încărcarea serviciilor și numărul total de clienți
async function fetchServices() {
  try {
    const response = await fetch("api/admin/services-clients");
    if (!response.ok) {
      throw new Error("Eroare la preluarea datelor");
    }
    const services = await response.json();

    const tableBody = document.getElementById("services-table");
    tableBody.innerHTML = ""; // Resetăm conținutul tabelului

    services.forEach((service) => {
      const row = document.createElement("tr");

      row.innerHTML = `
          <td>${service.Serviciu}</td>
          <td>${service.NrClienti}</td>
        `;

      tableBody.appendChild(row);
    });
  } catch (error) {
    console.error("Eroare:", error);
  }
}

// Funcție pentru butonul "Înapoi"
function setupBackButton() {
  const backButton = document.querySelector(".back-button");
  if (backButton) {
    backButton.addEventListener("click", (event) => {
      event.preventDefault(); // Previne comportamentul implicit al linkului
      window.location.href = "admin.html"; // Redirecționare către admin.html
    });
  }
}

// Apelăm funcțiile când pagina se încarcă
window.onload = () => {
  fetchServices();
  setupBackButton();
};
