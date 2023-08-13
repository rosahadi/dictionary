"use strict";

import "core-js/stable";

import { ripple } from "./ripple.js";
import dictionaryApp from "./dictionary.js";

// Initialize the app when the DOM is fully loaded
document.addEventListener("DOMContentLoaded", dictionaryApp.init);

// Add ripple effect to elements with the 'data-ripple' attribute
const rippleElems = document.querySelectorAll("[data-ripple]");
rippleElems.forEach((rippleElem) => ripple(rippleElem));

// Switches theme
const switchTheme = function (e) {
  if (e.target.checked) {
    document.documentElement.setAttribute("data-theme", "dark");
  } else {
    document.documentElement.setAttribute("data-theme", "light");
  }
};
const themeToggle = document.querySelector(".theme-toggle .checkbox");
themeToggle.addEventListener("change", switchTheme);
