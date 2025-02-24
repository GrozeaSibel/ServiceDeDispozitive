document.addEventListener("DOMContentLoaded", async () => {
  const idClient = sessionStorage.getItem("id_client");

  if (!idClient) {
    alert(
      "Eroare: ID-ul clientului nu a fost găsit! Te rog să te autentifici din nou."
    );
    return;
  }

  try {
    const response = await fetch(`/api/dispozitive/${idClient}`);
    const dispozitive = await response.json();

    if (response.ok) {
      const tabelBody = document.querySelector("#tabel-dispozitive tbody");
      tabelBody.innerHTML = ""; // Curățăm tabelul

      dispozitive.forEach((dispozitiv) => {
        const row = document.createElement("tr");

        row.innerHTML = `
            
            <td>${dispozitiv.tip}</td>
            <td>${dispozitiv.marca}</td>
            <td>${dispozitiv.model}</td>
          `;

        tabelBody.appendChild(row);
      });
    } else {
      alert(dispozitive.message || "Eroare la preluarea dispozitivelor!");
    }
  } catch (error) {
    console.error("Eroare la preluarea dispozitivelor:", error);
  }
});
const btnInapoi = document.getElementById("btn-inapoi");

// Butonul Înapoi redirecționează utilizatorul la pagina principală a clientului
btnInapoi.addEventListener("click", () => {
  window.location.href = "client.html";
});
