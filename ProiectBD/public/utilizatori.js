// Așteaptă până când tot conținutul paginii este încărcat
document.addEventListener("DOMContentLoaded", async () => {
  // Obține ID-ul clientului și al administratorului din sessionStorage
  const idClient = sessionStorage.getItem("id_client");
  const idAdmin = sessionStorage.getItem("id_administrator");

  // Dacă utilizatorul nu este autentificat, afișează un mesaj și redirecționează la pagina de login
  if (!idClient && !idAdmin) {
    alert("Nu sunteți autentificat!");
    window.location.href = "/index.html"; // Redirecționează la login
    return;
  }

  // Verifică dacă utilizatorul este un client
  if (idClient) {
    // Fetch pentru preluarea datelor personale ale clientului
    try {
      const response = await fetch(`/api/client/date-personale/${idClient}`);
      const datePersonale = await response.json();

      // Dacă răspunsul este valid, completează formularul cu datele personale
      if (response.ok) {
        document.getElementById("nume").value = datePersonale.nume;
        document.getElementById("prenume").value = datePersonale.prenume;
        document.getElementById("adresa").value = datePersonale.adresa || "";
        document.getElementById("telefon").value = datePersonale.telefon || "";
        document.getElementById("email").value = datePersonale.email || "";
      } else {
        alert("Eroare la încărcarea datelor: " + datePersonale.message);
      }
    } catch (error) {
      console.error("Eroare la preluarea datelor personale:", error);
    }

    // Adaugă eveniment pentru butonul "Înapoi" pentru redirecționare
    document.getElementById("btn-inapoi")?.addEventListener("click", () => {
      window.location.href = "/client.html"; // Redirecționează la meniul clientului
    });
  }

  // Gestionează trimiterea formularului pentru actualizarea datelor personale ale clientului
  document
    .getElementById("formular-date-personale")
    ?.addEventListener("submit", async (e) => {
      e.preventDefault(); // Previne comportamentul implicit al formularului

      // Creează obiectul cu datele actualizate din formular
      const dateActualizate = {
        nume: document.getElementById("nume").value,
        prenume: document.getElementById("prenume").value,
        adresa: document.getElementById("adresa").value,
        telefon: document.getElementById("telefon").value,
        email: document.getElementById("email").value,
      };

      // Trimite o cerere PUT pentru actualizarea datelor
      try {
        const response = await fetch(`/api/client/date-personale/${idClient}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(dateActualizate),
        });

        const result = await response.json();

        // Afișează un mesaj de succes sau eroare în funcție de răspuns
        if (response.ok) {
          alert("Datele au fost actualizate cu succes!");
        } else {
          alert("Eroare la actualizare: " + result.message);
        }
      } catch (error) {
        console.error("Eroare la actualizarea datelor personale:", error);
      }
    });

  // Verifică dacă utilizatorul este un administrator
  if (idAdmin) {
    // Fetch pentru preluarea listei de utilizatori
    try {
      const response = await fetch("/api/utilizatori");
      const utilizatori = await response.json();

      // Dacă răspunsul este valid, afișează utilizatorii în tabel
      if (response.ok) {
        const tabel = document.querySelector("#tabel-utilizatori tbody");
        tabel.innerHTML = ""; // Golește tabelul înainte de a adăuga datele

        utilizatori.forEach((utilizator) => {
          // Creează un rând pentru fiecare utilizator și adaugă-l în tabel
          const row = document.createElement("tr");
          row.innerHTML = `
            <td>${utilizator.id_utilizator}</td>
            <td>${utilizator.nume_utilizator}</td>
            <td>${utilizator.rol}</td>
            <td>${
              utilizator.nume_client
                ? `${utilizator.nume_client} ${utilizator.prenume_client}`
                : utilizator.nume_administrator
            }</td>
          `;
          tabel.appendChild(row);
        });
      } else {
        alert("Eroare la preluarea utilizatorilor: " + utilizatori.message);
      }
    } catch (error) {
      console.error("Eroare la preluarea utilizatorilor:", error);
    }

    // Adaugă eveniment pentru butonul "Înapoi" pentru redirecționare
    document.getElementById("btn-inapoi")?.addEventListener("click", () => {
      window.location.href = "/admin.html"; // Redirecționează la meniul administratorului
    });
  }
});

// Butoane și funcționalități pentru adăugarea unui client
const btnAdaugaClient = document.getElementById("btn-adauga-client");
const modalClient = document.getElementById("adauga-client-modal");
const btnInchideClient = document.getElementById("btn-inchide-client");

// Afișare formular pentru adăugarea unui client
btnAdaugaClient.addEventListener("click", () => {
  modalClient.classList.remove("hidden");
});

// Închide formularul de adăugare a unui client
btnInchideClient.addEventListener("click", () => {
  modalClient.classList.add("hidden");
});

// Gestionare trimitere formular pentru adăugarea unui client nou
document
  .getElementById("adauga-client-form")
  .addEventListener("submit", async (e) => {
    e.preventDefault(); // Previne comportamentul implicit al formularului

    // Creează obiectul cu datele clientului din formular
    const userData = {
      username: document.getElementById("username-client").value.trim(),
      parola: document.getElementById("parola-client").value.trim(),
      rol: "client",
      nume: document.getElementById("nume-client").value.trim(),
      prenume: document.getElementById("prenume-client").value.trim(),
      adresa: document.getElementById("adresa-client").value.trim() || null,
      telefon: document.getElementById("telefon-client").value.trim() || null,
      email: document.getElementById("email-client").value.trim() || null,
      cnp: document.getElementById("cnp-client").value.trim(),
    };

    // Trimite cererea POST pentru a adăuga clientul
    try {
      const response = await fetch("/api/utilizatori", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      const result = await response.json();

      // Afișează un mesaj de succes sau eroare
      if (response.ok) {
        alert("Client adăugat cu succes!");
        modalClient.classList.add("hidden");
        location.reload(); // Reîncarcă pagina pentru a actualiza lista
      } else {
        alert("Eroare: " + result.message);
      }
    } catch (error) {
      console.error("Eroare la comunicarea cu serverul:", error);
      alert("A apărut o eroare. Încercați din nou!");
    }
  });

////
// Butoane și funcționalități pentru adăugarea unui administrator
const btnAdaugaAdmin = document.getElementById("btn-adauga-admin");
const modalAdmin = document.getElementById("adauga-admin-modal");
const btnInchideAdmin = document.getElementById("btn-inchide-admin");

// Afișare formular pentru adăugarea unui administrator
btnAdaugaAdmin.addEventListener("click", () => {
  modalAdmin.classList.remove("hidden");
});

// Închide formularul de adăugare a unui administrator
btnInchideAdmin.addEventListener("click", () => {
  modalAdmin.classList.add("hidden");
});

// Gestionare trimitere formular pentru adăugarea unui administrator nou
document
  .getElementById("adauga-admin-form")
  .addEventListener("submit", async (e) => {
    e.preventDefault();

    const adminData = {
      username: document.getElementById("username-admin").value.trim(),
      parola: document.getElementById("parola-admin").value.trim(),
      rol: "administrator",
      nume: document.getElementById("nume_complet-admin").value.trim(),
      adresa: document.getElementById("adresa-admin").value.trim() || null,
      telefon: document.getElementById("telefon-admin").value.trim() || null,
      email: document.getElementById("email-admin").value.trim() || null,
      cnp: document.getElementById("cnp-admin").value.trim(),
    };

    console.log("🔍 Date trimise către server:", adminData);

    try {
      const response = await fetch("/api/utilizatoriA", {
        // Asigură-te că e corect endpoint-ul
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(adminData),
      });

      const result = await response.json();
      console.log("🔍 Răspuns primit de la server:", result);

      if (response.ok) {
        alert("Administrator adăugat cu succes!");
        document.getElementById("adauga-admin-modal").classList.add("hidden");
        location.reload();
      } else {
        alert("Eroare: " + result.message);
      }
    } catch (error) {
      console.error(" Eroare la comunicarea cu serverul:", error);
      alert("A apărut o eroare. Încercați din nou!");
    }
  });
