// Preluare date de la server și afișare în tabel
fetch("/api/admin/clienti-ordonati-dispozitive")
  .then((response) => response.json())
  .then((data) => {
    const tableBody = document.querySelector("#tabel-clienti tbody");
    tableBody.innerHTML = ""; // Golește tabelul înainte de a adăuga date

    data.forEach((client) => {
      const row = `
        <tr>
          <td>${client.Nume}</td>
          <td>${client.Prenume}</td>
        </tr>
      `;
      tableBody.innerHTML += row;
    });
  })
  .catch((error) => console.error("Eroare la preluarea datelor:", error));

// Buton pentru a merge înapoi la meniul anterior
document.getElementById("btn-inapoi").addEventListener("click", () => {
  window.location.href = "admin.html"; // Înlocuiește cu calea reală
});
