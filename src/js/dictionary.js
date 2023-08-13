"use strict";

import { ripple } from "./ripple.js";

class DictionaryApp {
  constructor() {
    this.input = document.querySelector("[data-search-field]");
    this.searchClearBtn = document.querySelector("[data-search-clear-btn]");
    this.searchBtn = document.querySelector("[data-search-btn]");
    this.dictionary = document.querySelector(".dictionary");
    this.container = document.querySelector(".container");
    this.sound = document.getElementById("sound");

    this.handleSearch = this.handleSearch.bind(this);
    this.onSearchButtonClick = this.onSearchButtonClick.bind(this);
    this.onSearchFieldKeyDown = this.onSearchFieldKeyDown.bind(this);
    this.init = this.init.bind(this);
  }

  async getWordDefinitions(word) {
    const apiUrl = `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`;
    try {
      const response = await fetch(apiUrl);
      if (response.status === 404) {
        throw new Error("No definitions found for the word.");
      }

      const data = response.json();
      return data;
    } catch (error) {
      console.error(
        "An error occurred while fetching word definitions.",
        error
      );

      this.dictionary.innerHTML = `
      <h2 class="error">Couldn't Find The Word</h2>
    `;
    }
  }

  displayDictionary(data) {
    const { word, phonetic, meanings, phonetics, sourceUrls } = data[0];

    let audioUrl = "";

    for (const phonetic of phonetics) {
      if (!phonetic.audio) continue;

      audioUrl = phonetic.audio;
      break; // Stop after finding the first audio URL
    }

    // Clear previous content
    this.dictionary.innerHTML = "";

    const wordHeader = `
          <div class="word-header">
            <div class="word-header-text">
              <h1 class="h1">${word}</h1>
              <span class="pronunciation">${phonetic}</span>
            </div>
            <button class="icon-btn big" data-ripple>
              <i class="ph-fill ph-play"></i>
              <i class="ph-fill ph-pause"></i>
              <div class="state-layer"></div>
            </button>
          </div>
        `;

    this.dictionary.insertAdjacentHTML("afterbegin", wordHeader);
    const playButton = document.querySelector(".icon-btn.big");
    const playIcon = document.querySelector(".ph-play");
    const pauseIcon = document.querySelector(".ph-pause");

    playButton.addEventListener("click", () =>
      this.playSound(audioUrl, playIcon, pauseIcon)
    );

    const rippleElems = document.querySelectorAll("[data-ripple]");
    rippleElems.forEach((rippleElem) => ripple(rippleElem));

    // Render meanings if available
    if (meanings && meanings.length > 0) {
      if (meanings.length === 1) {
        this.renderMeaning(meanings[0]);
      } else if (meanings.length === 2) {
        this.renderMeaning(meanings[0]);
        this.renderMeaning(meanings[1]);
      } else {
        // Render each meaning
        meanings.forEach((meaning) => {
          this.renderMeaning(meaning);
        });
      }
    }

    const footer = `
          <footer class="footer">
            <span class="footer-heading">Source</span>
            <a href="${sourceUrls[0]}" class="source-link">${sourceUrls[0]}</a>
            <i class="ph-bold ph-arrow-square-out"></i>
          </footer>
        `;

    this.container.insertAdjacentHTML("beforeend", footer);
  }

  renderMeaning(meaning) {
    const definitionsList = meaning.definitions
      .slice(0, 3)
      .map(
        (definition) => `
              <li class="definition-item">
                <span class="bullet">&bull;</span>
                <div class="content">
                  <p class="definition">
                    ${definition.definition}
                  </p>
                  ${
                    definition.example
                      ? `<span class="example">"${definition.example}"</span>`
                      : ""
                  }
                </div>
              </li>`
      )
      .join("");

    const partOfSpeechDiv = `
          <div class="partOfSpeech">
            <h3 class="h3">${meaning.partOfSpeech}</h3>
            <span class="span-heading">Meaning</span>
            <ul class="definitions-list">${definitionsList}</ul>

            ${
              meaning.synonyms && meaning.synonyms.length > 0
                ? `<div class="synonyms">
                <span class="span-heading synonyms-heading">Synonyms</span>
                <span class="synonym-word">${meaning.synonyms[0]}</span>
              </div>`
                : ""
            }
          </div>
        `;

    this.dictionary.insertAdjacentHTML("beforeend", partOfSpeechDiv);
  }

  playSound(audioUrl, playIcon, pauseIcon) {
    const audio = new Audio(audioUrl);

    audio.addEventListener("play", () => {
      playIcon.style.display = "none";
      pauseIcon.style.display = "inline-block";
    });

    audio.addEventListener("pause", () => {
      playIcon.style.display = "inline-block";
      pauseIcon.style.display = "none";
    });

    audio.play();
  }

  async handleSearch() {
    const urlParams = new URLSearchParams(window.location.search);
    const searchTerm = urlParams.get("search");

    if (searchTerm) {
      // this.input.value = searchTerm;
      const data = await this.getWordDefinitions(searchTerm);
      if (data) {
        this.displayDictionary(data);
      }
    }
  }

  init() {
    this.handleSearch();

    this.searchClearBtn.addEventListener(
      "click",
      () => (this.input.value = "")
    );

    this.searchBtn.addEventListener("click", () => {
      this.onSearchButtonClick();
      this.input.value = "";
    });

    this.input.addEventListener("keydown", this.onSearchFieldKeyDown);
  }

  onSearchButtonClick() {
    const inputValue = this.input.value.trim().toLowerCase();

    if (inputValue) {
      this.updateURL(inputValue);
      this.getWordDefinitions(inputValue);
    }
  }

  onSearchFieldKeyDown(event) {
    if (event.key === "Enter" && this.input.value.trim()) {
      event.preventDefault();
      this.searchBtn.click();
    }
  }

  updateURL(searchValue) {
    const root = window.location.origin;
    window.location = `${root}/?search=${searchValue}`;
  }
}

export default new DictionaryApp();
