document.addEventListener("DOMContentLoaded", () => {
  const tabelClienti = document.querySelector(
    "#tabel-clienti-fara-dispozitive tbody"
  );
  const btnInapoi = document.querySelector("#btn-inapoi");

  // Funcția pentru a prelua clienții fără dispozitive din backend
  const incarcaClientiFaraDispozitive = async () => {
    try {
      const response = await fetch("/api/admin/clienti-fara-dispozitive");
      if (!response.ok) {
        throw new Error("Eroare la preluarea datelor");
      }
      const clienti = await response.json();

      // Curăță tabelul
      tabelClienti.innerHTML = "";

      // Adaugă rânduri în tabel pentru fiecare client
      clienti.forEach((client) => {
        const rand = document.createElement("tr");
        rand.innerHTML = `
            <td>${client.nume}</td>
            <td>${client.prenume}</td>
          `;
        tabelClienti.appendChild(rand);
      });
    } catch (error) {
      console.error("Eroare:", error);
    }
  };

  // Butonul Înapoi redirecționează utilizatorul la pagina principală a adminului
  btnInapoi.addEventListener("click", () => {
    window.location.href = "admin.html";
  });

  // Încarcă datele la inițializarea paginii
  incarcaClientiFaraDispozitive();
});
