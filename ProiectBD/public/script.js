document.getElementById("login-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = e.target.username.value;
  const password = e.target.password.value;

  try {
    const response = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const result = await response.json();

    if (response.ok) {
      if (result.user.rol === "client") {
        sessionStorage.setItem("id_client", result.user.id_client); // Salveaza client ID
        window.location.href = "/client.html"; // Redirectioneaza catre meniul client
      } else if (result.user.rol === "administrator") {
        sessionStorage.setItem(
          "id_administrator",
          result.user.id_administrator
        );
        window.location.href = "/admin.html";
      }
    } else {
      alert(result.message);
    }
  } catch (error) {
    console.error("Login error:", error);
  }
});
