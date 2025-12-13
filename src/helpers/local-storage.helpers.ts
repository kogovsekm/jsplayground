// clear local storage
export const clearLocalStorage = () => {
  localStorage.clear();
};

// save code to local storage
export const saveCodeToLocalStorage = (code: string) => {
  localStorage.setItem("code", code);
};

// get code from local storage
export const getCodeFromLocalStorage = () => {
  return localStorage.getItem("code");
};
