// REGISTER
const api = `http://${window.location.hostname}:3000`;

const form = document.querySelector("#register-form");

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const formData = new FormData(form);
  const name = formData.get("name");

  const email = formData.get("email");
  const password = formData.get("password");

  const response = await fetch(`${api}/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name, email, password }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    alert(errorText);
    return;
  }

  const { token } = await response.json();
  localStorage.setItem("token", token);

  window.location.href = "/login.html";
});
