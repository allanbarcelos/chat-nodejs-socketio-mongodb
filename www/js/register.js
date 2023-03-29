// REGISTER
const api = `//${window.location.hostname}:3000`;

const form = document.querySelector("#register-form");

const registerButton = document.getElementById("register-button");
const loadingButton = document.getElementById("loading-button");

loadingButton.style.display = "none";
registerButton.style.display = "block";

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  loadingButton.style.display = "block";
  registerButton.style.display = "none";

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
  }).catch(() => {
    loadingButton.style.display = "none";
    registerButton.style.display = "block";
  });

  if (!response?.ok) {
    const errorText = await response?.text();
    if (errorText) alert(errorText);
    else alert("System Failure");
    return;
  }

  const { token } = await response.json();
  localStorage.setItem("token", token);

  window.location.href = "/login.html";
});
