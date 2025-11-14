let globalLogoutFn = null;

export const registerGlobalLogout = (fn) => {
  globalLogoutFn = fn;
};

export const invokeGlobalLogout = async () => {
  if (typeof globalLogoutFn === "function") {
    await globalLogoutFn();
  }
};
