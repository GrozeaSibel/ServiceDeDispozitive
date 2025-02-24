document.addEventListener("DOMContentLoaded", async () => {
  console.log("Script încărcat corect.");

  const idClient = sessionStorage.getItem("id_client");
  console.log("ID Client:", idClient);

  if (!idClient) {
    alert("Eroare: ID-ul clientului nu este găsit.");
    return;
  }

  try {
    console.log("Trimit cerere către backend...");
    const response = await fetch(`/api/reparatii/${idClient}`);
    console.log("Răspuns de la backend:", response);

    const reparatii = await response.json();
    console.log("Date reparații:", reparatii);

    if (response.ok) {
      const tabelBody = document.querySelector("#tabel-reparatii tbody");
      tabelBody.innerHTML = ""; // Curățăm tabelul

      reparatii.forEach((reparatie) => {
        const row = document.createElement("tr");
        row.innerHTML = `
          
          <td>${formatDate(
            reparatie.data
          )}</td> <!-- Apelăm funcția formatDate aici -->
          <td>${reparatie.status}</td>
          <td>${reparatie.tip_dispozitiv}</td>
          <td>${reparatie.marca}</td>
          <td>${reparatie.model}</td>
          <td>
            <button onclick="afiseazaDetalii(${
              reparatie.id_reparatie
            })">Vezi Detalii</button>
          </td>
        `;
        tabelBody.appendChild(row);
      });
    } else {
      alert(reparatii.message || "Eroare la preluarea reparațiilor!");
    }
  } catch (error) {
    console.error("Eroare la preluarea reparațiilor:", error);
  }
});

// Funcția pentru butonul "Vezi Detalii"
function afiseazaDetalii(idReparatie) {
  window.location.href = `/detalii_reparatie.html?id=${idReparatie}`;
}

// Funcția pentru formatarea datei
function formatDate(dateString) {
  if (!dateString) return "N/A";

  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${day}-${month}-${year}`;
}
const btnInapoi = document.getElementById("btn-inapoi");

// Butonul Înapoi redirecționează utilizatorul la pagina principală a clientului
btnInapoi.addEventListener("click", () => {
  window.location.href = "client.html";
});
