
// Session expiry time (1 hour in milliseconds)
export const SESSION_EXPIRY = 60 * 60 * 1000; 

export const updateSessionExpiry = () => {
  const expiryTime = Date.now() + SESSION_EXPIRY;
  localStorage.setItem("sessionExpiry", expiryTime.toString());
};

export const isSessionValid = (): boolean => {
  const sessionExpiry = localStorage.getItem("sessionExpiry");
  if (!sessionExpiry) return false;
  
  const expiryTime = parseInt(sessionExpiry, 10);
  return Date.now() < expiryTime;
};
