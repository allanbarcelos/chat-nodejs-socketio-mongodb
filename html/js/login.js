// LOGIN
const api = `//${window.location.hostname}/api`;

const form = document.querySelector("#login-form");

const roomIdDiv = document.querySelector("#room-id-div");
roomIdDiv.style.display = "none";

form.addEventListener("change", async (event) => {
  const value = event.target.value;
  if (value === "room-id") roomIdDiv.style.display = "block";
  else roomIdDiv.style.display = "none";
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(form);
  const email = formData.get("email");
  const password = formData.get("password");
  const typeRoom = formData.get("type-room");
  const roomID = formData.get("room-id");
  const response = await fetch(`${api}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password, typeRoom, roomID }),
  });
  if (!response.ok) {
    const errorText = await response.text();
    alert(errorText);
    return;
  }
  const { token } = await response.json();
  localStorage.setItem("token", token);
  window.location.href = "/index.html";
});