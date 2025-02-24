document.addEventListener("DOMContentLoaded", async () => {
  const idClient = localStorage.getItem("id_client"); // Preia ID-ul clientului logat

  if (!idClient) {
    alert("Nu sunteți autentificat!");
    window.location.href = "/index.html";
    return;
  }

  try {
    const response = await fetch(`/api/dispozitive/${idClient}`);
    const dispozitive = await response.json();

    if (response.ok) {
      const container = document.getElementById("dispozitive-container");
      if (dispozitive.length === 0) {
        container.innerHTML = "<p>Nu aveți dispozitive adăugate.</p>";
      } else {
        dispozitive.forEach((dispozitiv) => {
          const dispozitivEl = document.createElement("div");
          dispozitivEl.innerHTML = `
              <p><strong>Tip:</strong> ${dispozitiv.tip}</p>
              <p><strong>Marcă:</strong> ${dispozitiv.marca}</p>
              <p><strong>Model:</strong> ${dispozitiv.model}</p>
              <hr>
            `;
          container.appendChild(dispozitivEl);
        });
      }
    } else {
      alert("Eroare la preluarea dispozitivelor: " + dispozitive.message);
    }
  } catch (error) {
    console.error("Eroare:", error);
  }
});
