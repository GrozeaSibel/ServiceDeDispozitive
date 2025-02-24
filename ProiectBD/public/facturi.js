document.addEventListener("DOMContentLoaded", async () => {
  const idClient = sessionStorage.getItem("id_client");

  if (!idClient) {
    alert("Nu sunteți autentificat!");
    window.location.href = "/index.html";
    return;
  }

  try {
    // Preia facturile clientului
    const response = await fetch(`/api/facturi/${idClient}`);
    const facturi = await response.json();

    if (response.ok) {
      const tabelFacturi = document.querySelector("#tabel-facturi tbody");
      tabelFacturi.innerHTML = ""; // Golește tabelul înainte de a adăuga date

      facturi.forEach((factura) => {
        const row = document.createElement("tr");
        row.innerHTML = `
          
          <td>${formatDate(factura.data_facturare)}</td>
          <td>${factura.suma} RON</td>
        `;
        tabelFacturi.appendChild(row);
      });
    } else {
      alert("Eroare la preluarea facturilor!");
    }
  } catch (error) {
    console.error("Eroare:", error);
  }
});

// Funcție pentru formatarea datei
function formatDate(dateString) {
  const options = { year: "numeric", month: "long", day: "numeric" };
  return new Date(dateString).toLocaleDateString("ro-RO", options);
}

// Funcționalitate pentru butonul Înapoi
document.getElementById("btn-inapoi").addEventListener("click", () => {
  window.history.back(); // Navighează înapoi la pagina anterioară
});
