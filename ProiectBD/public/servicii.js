document.addEventListener("DOMContentLoaded", async () => {
  try {
    // Preia lista serviciilor din backend
    const response = await fetch("/api/servicii");
    const servicii = await response.json();

    if (response.ok) {
      const tabelServicii = document.querySelector("#tabel-servicii tbody");
      tabelServicii.innerHTML = ""; // Golește tabelul înainte de populare

      servicii.forEach((serviciu) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td><input type="checkbox" data-pret="${serviciu.pret}"></td>
            <td>${serviciu.denumire}</td>
            <td>${serviciu.durata}</td>
            <td>${serviciu.pret}</td>
          `;
        tabelServicii.appendChild(row);
      });
    } else {
      alert("Eroare la preluarea serviciilor!");
    }
  } catch (error) {
    console.error("Eroare:", error);
  }

  // Calculează costul estimat când sunt selectate serviciile
  document.querySelector("#tabel-servicii").addEventListener("change", () => {
    const checkboxes = document.querySelectorAll(
      "input[type='checkbox']:checked"
    );
    let totalCost = 0;

    checkboxes.forEach((checkbox) => {
      totalCost += parseFloat(checkbox.dataset.pret);
    });

    document.getElementById("cost-estimat").innerText = totalCost.toFixed(2);
  });

  // Buton Înapoi
  document.getElementById("btn-inapoi").addEventListener("click", () => {
    window.history.back();
  });
});
