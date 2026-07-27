// simple fake auth system

export const setCurrentUser = (user) => {
  localStorage.setItem("life-link-user", JSON.stringify(user));
};

export const getCurrentUser = () => {
  return JSON.parse(localStorage.getItem("life-link-user"));
};

export const clearCurrentUser = () => {
  localStorage.removeItem("life-link-user");
};