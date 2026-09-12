export function saveSession({ token = "", user }) {
  localStorage.setItem("isLoggedIn", "true");
  localStorage.setItem("authToken", token);
  localStorage.setItem("userRole", user.role);
  localStorage.setItem("userId", user.id);
  localStorage.setItem("userName", user.name);
  localStorage.setItem("userEmail", user.email);
}

export function logout() {
  [
    "isLoggedIn",
    "authToken",
    "userRole",
    "userId",
    "userName",
    "userEmail"
  ].forEach((key) => localStorage.removeItem(key));
}

export function currentRole() {
  return localStorage.getItem("userRole");
}

export function isLoggedIn() {
  return localStorage.getItem("isLoggedIn") === "true";
}
