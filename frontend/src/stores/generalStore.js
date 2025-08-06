import { writable } from 'svelte/store';

const storedUser = JSON.parse(localStorage.getItem('currentUser')) || null;
const storedToken = localStorage.getItem('token') || null;
const storedTokenExpiry = localStorage.getItem('tokenExpiry') || null;

export const currentUser = writable(storedUser);
export const token = writable(storedToken);
export const tokenExpiry = writable(storedTokenExpiry);
export const lastVisitedRoute = writable('/');

currentUser.subscribe((value) => {
  localStorage.setItem('currentUser', JSON.stringify(value));
});

token.subscribe((value) => {
  if (value) {
    localStorage.setItem('token', value);
  } else {
    localStorage.removeItem('token');
  }
});

tokenExpiry.subscribe((value) => {
  if (value) {
    localStorage.setItem('tokenExpiry', value.toString()); 
  } else {
    localStorage.removeItem('tokenExpiry');
  }
});

export const logout = () => {
  currentUser.set(null); 
  token.set(null); 
  tokenExpiry.set(null); 
  lastVisitedRoute.set('/'); 
  localStorage.removeItem('currentUser'); 
  localStorage.removeItem('token');
  localStorage.removeItem('tokenExpiry'); 
  window.location.href = '/login'; 
};
