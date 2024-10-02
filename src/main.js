// src/main.js
import Alpine from "alpinejs";
import "./style.css";
import midiRouter from "./midi-router";

window.Alpine = Alpine;

Alpine.data("midiRouter", midiRouter);
Alpine.start();
