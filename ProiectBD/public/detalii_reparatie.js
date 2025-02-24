document.addEventListener("DOMContentLoaded", async () => {
  const idReparatie = new URLSearchParams(window.location.search).get("id");

  if (!idReparatie) {
    alert("Eroare: ID-ul reparației nu a fost găsit!");
    return;
  }

  try {
    // Fetch servicii asociate
    const responseServicii = await fetch(
      `/api/reparatii/servicii/${idReparatie}`
    );
    const servicii = await responseServicii.json();

    if (responseServicii.ok) {
      const tabelServicii = document.getElementById("servicii-tabel");
      servicii.forEach((serviciu) => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${serviciu.denumire}</td>
          <td>${serviciu.durata} min</td>
          <td>${serviciu.pret} RON</td>
        `;
        tabelServicii.appendChild(row);
      });
    } else {
      alert("Eroare la preluarea serviciilor reparației!");
    }

    // Fetch tehnicieni implicați
    const responseTehnicieni = await fetch(
      `/api/reparatii/tehnicieni/${idReparatie}`
    );
    const tehnicieni = await responseTehnicieni.json();

    if (responseTehnicieni.ok) {
      const listTehnicieni = document.getElementById("tehnicieni-list");
      tehnicieni.forEach((tehnician) => {
        const listItem = document.createElement("li");
        listItem.innerText = `${tehnician.nume_tehnician} ${tehnician.prenume_tehnician} (${tehnician.specializare})`;
        listTehnicieni.appendChild(listItem);
      });
    } else {
      alert("Eroare la preluarea tehnicienilor reparației!");
    }
  } catch (error) {
    console.error("Eroare la afișarea detaliilor reparației:", error);
  }

  // Buton Înapoi
  document.getElementById("btn-inapoi").addEventListener("click", () => {
    window.history.back();
  });
});
