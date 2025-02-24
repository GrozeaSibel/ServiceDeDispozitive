document.getElementById("signup-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const userData = {
    username: document.getElementById("username").value.trim(),
    password: document.getElementById("password").value.trim(),
    nume: document.getElementById("nume").value.trim(),
    prenume: document.getElementById("prenume").value.trim(),
    cnp: document.getElementById("cnp").value.trim(),
    adresa: document.getElementById("adresa").value.trim(),
    telefon: document.getElementById("telefon").value.trim(),
    email: document.getElementById("email").value.trim(),
  };
  // Verifică dacă toate câmpurile sunt completate și dacă CNP-ul este valid
  if (
    !userData.username ||
    !userData.password ||
    !userData.nume ||
    !userData.prenume ||
    !userData.cnp
  ) {
    alert("Toate câmpurile sunt obligatorii!");
    return;
  }

  if (!/^\d{13}$/.test(userData.cnp)) {
    alert("CNP-ul trebuie să conțină exact 13 cifre!");
    return;
  }
  try {
    const response = await fetch("/api/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });

    const result = await response.json();

    if (response.ok) {
      alert("Cont creat cu succes!");
      window.location.href = "index.html"; // Redirecționează la login
    } else {
      alert(result.message || "Eroare la crearea contului!");
    }
  } catch (error) {
    console.error("Eroare la sign-up:", error);
    alert("A apărut o eroare, încearcă din nou!");
  }
});
