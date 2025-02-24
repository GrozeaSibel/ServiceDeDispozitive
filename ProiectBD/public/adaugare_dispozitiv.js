document
  .getElementById("formular-dispozitiv-reparatii")
  .addEventListener("submit", async (e) => {
    e.preventDefault();

    const idClient = sessionStorage.getItem("id_client");

    if (!idClient) {
      alert("Nu sunteți autentificat!");
      window.location.href = "/index.html";
      return;
    }

    const tip = document.getElementById("tip").value;
    const marca = document.getElementById("marca").value;
    const model = document.getElementById("model").value;
    const reparatii = Array.from(
      document.getElementById("reparatii").selectedOptions
    ).map((option) => option.value);

    const payload = {
      id_client: idClient,
      tip,
      marca,
      model,
      reparatii,
    };

    try {
      const response = await fetch("/api/dispozitive-reparatii", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok) {
        alert("Dispozitivul a fost adăugat cu succes!");

        const divConfirmare = document.getElementById("confirmare-factura");
        const detaliiFactura = document.getElementById("detalii-factura");

        detaliiFactura.textContent = `Suma totală pentru reparații: ${result.sumaTotala.toFixed(
          2
        )} RON.`;
        divConfirmare.style.display = "block";

        document.getElementById("formular-dispozitiv-reparatii").reset();
      } else {
        alert("Eroare: " + result.message);
      }
    } catch (error) {
      console.error("Eroare:", error);
    }
  });

const btnInapoi = document.getElementById("btn-inapoi");

// Butonul Înapoi redirecționează utilizatorul la pagina principală a clientului
btnInapoi.addEventListener("click", () => {
  window.location.href = "client.html";
});
