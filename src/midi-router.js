import { generateRandomID } from "@/utils.js";

export default () => ({
  debug: true,
  consoleOpen: false,
  midiAccess: null,
  inputs: [],
  outputs: [],
  rows: [],
  connections: [],
  logMessages: [],
  darkMode: false,

  colors: [
    { label: "White", value: "#ffffff", text: "black" },
    { label: "Black", value: "#000000", text: "white" },
    { label: "Gray", value: "#3F3F46", text: "white" },
    { label: "Red", value: "#fca5a5" },
    { label: "Orange", value: "#fdba74" },
    { label: "Amber", value: "#fcd34d" },
    { label: "Yellow", value: "#fde047" },
    { label: "Lime", value: "#bef264" },
    { label: "Green", value: "#86efac" },
    { label: "Emerald", value: "#6ee7b7" },
    { label: "Teal", value: "#5eead4" },
    { label: "Cyan", value: "#67e8f9" },
    { label: "Sky", value: "#7dd3fc" },
    { label: "Blue", value: "#93c5fd" },
    { label: "Indigo", value: "#a5b4fc" },
    { label: "Violet", value: "#c4b5fd" },
    { label: "Purple", value: "#d8b4fe" },
    { label: "Fuchsia", value: "#f0abfc" },
    { label: "Pink", value: "#f9a8d4" },
    { label: "Rose", value: "#fda4af" },
  ],

  async init() {
    this.loadDarkModePreference();
    await this.initializeMIDI();
    this.loadConnections();

    // this.restoreState();
    // this.initDemoContent();
    // this.dummyLogger();
  },

  initDemoContent() {
    this.inputs = [
      { id: "dummy-virus", name: "Virus TI" },
      { id: "dummy-midi", name: "MIDI Keyboard" },
      { id: "dummy-monkey", name: "WAVY MONKEY" },
      { id: "dummy-elektron", name: "Elektron Digitakt - MIDI IN" },
    ];

    this.outputs = [
      { id: "dummy-synth-1", name: "Virus TI" },
      { id: "dummy-synth-2", name: "JP-8000" },
      { id: "dummy-elektron", name: "Elektron Digitakt - MIDI OUT" },
      { id: "dummy-synth-3", name: "Novation Peak" },
      { id: "dummy-synth-4", name: "Prophet 6" },
      { id: "dummy-synth-5", name: "OB-6" },
      { id: "dummy-synth-6", name: "Virus C" },
      { id: "dummy-synth-7", name: "WASP DELUXE" },
      { id: "dummy-synth-8", name: "PRO-1" },
      { id: "dummy-synth-9", name: "Microsoft. GS Wavetable Synth" },
      { id: "dummy-synth-10", name: "SoundFont2 - Extreme" },
    ];

    this.rows = [
      {
        id: generateRandomID(),
        inputId: "dummy-virus",
        outputId: "dummy-synth-1",
        inputChannel: "all",
        outputChannel: 1,
      },
      {
        id: generateRandomID(),
        inputId: "dummy-midi",
        outputId: "dummy-synth-2",
        inputChannel: "all",
        outputChannel: 1,
      },
      {
        id: generateRandomID(),
        inputId: "dummy-monkey",
        outputId: "dummy-synth-3",
        inputChannel: 1,
        outputChannel: 1,
      },
      {
        id: generateRandomID(),
        inputId: "dummy-monkey",
        outputId: "dummy-synth-2",
        inputChannel: 2,
        outputChannel: 1,
      },
      {
        id: generateRandomID(),
        inputId: "dummy-monkey",
        outputId: "dummy-synth-3",
        inputChannel: 2,
        outputChannel: 1,
      },
      {
        id: generateRandomID(),
        inputId: "dummy-electron",
        outputId: "dummy-synth-4",
        inputChannel: 4,
        outputChannel: 2,
      },
    ];

    this.rows = this.rows.map((row) => ({
      ...row,
      color: this.colors[Math.floor(Math.random() * this.colors.length)],
    }));

    this.consoleOpen = true;

    this.saveConnections();
    this.updateConnections();
  },

  clearPersistedState() {
    localStorage.removeItem("midi-router-state");
    localStorage.removeItem("midiConnections");
    this.rows = [];
    this.connections = [];
    this.logMessages = [];

    console.log(`[DEBUG] ---------- Cleared persisted state ----------`);
  },

  persistState() {
    localStorage.setItem(
      "midi-router-state",
      JSON.stringify({
        rows: this.rows,
        debug: this.debug,
        darkMode: this.darkMode,
        consoleOpen: this.consoleOpen,
      }),
    );
  },

  restoreState() {
    const savedState = localStorage.getItem("midi-router-state");
    if (savedState) {
      const loaded = JSON.parse(savedState);
      this.rows = loaded.rows || [];
      this.debug = loaded.debug || false;
      this.darkMode = loaded.darkMode || false;
      this.consoleOpen = loaded.consoleOpen || false;
    }
  },

  dummyLogger() {
    const status =
      Math.floor(Math.random() * 16) * 16 + Math.floor(Math.random() * 16);
    const data1 = Math.floor(Math.random() * 127);
    const data2 = Math.floor(Math.random() * 127);
    const decodedMessage = this.decodeMIDIMessage(status, data1, data2);
    const channel = (status & 0xf) + 1;

    const midiEventTypes = [
      `Ch: ${channel} - Note Off: Note ${data1}, Velocity ${data2}`,
      `Ch: ${channel} - Note On: Note ${data1}, Velocity ${data2}`,
      // `Ch: ${channel} - Polyphonic Aftertouch: Note ${data1}, Pressure ${data2}`,
      `Ch: ${channel} - Control Change: Controller ${data1}, Value ${data2}`,
      // `Ch: ${channel} - Program Change: Program ${data1}`,
      // `Ch: ${channel} - Channel Aftertouch: Pressure ${data1}`,
      `Ch: ${channel} - Pitch Bend: Value ${(data2 << 7) + data1}`,
      // `Unknown: Status ${status.toString(16)}, Data [${data1}, ${data2}]`,
    ];

    const suffix = `| Raw: [${[status, data1, data2].map((d) => d.toString(16).padStart(2, "0")).join(" ")}]`;
    const randomMIDIEvent =
      midiEventTypes[Math.floor(Math.random() * midiEventTypes.length)];

    this.logToWindow(logMessage, "warning");
    const logMessage = `${randomMIDIEvent} ${suffix}`;

    if (Math.random() > 0.75) {
      this.logToWindow(logMessage, "info");
    } else if (Math.random() > 0.5) {
    } else if (Math.random() > 0.25) {
      this.logToWindow(logMessage, "error");
    } else {
      this.logToWindow(logMessage, "success");
    }

    setTimeout(this.dummyLogger.bind(this), Math.random() * 600);
  },

  async initializeMIDI() {
    try {
      this.midiAccess = await navigator.requestMIDIAccess();
      this.updateDeviceLists();
      this.midiAccess.onstatechange = () => {
        this.updateDeviceLists();
        this.updateConnections();
      };

      this.setupGlobalMIDIListeners();
      if (this.rows.length === 0) {
        this.addRow();
      }
    } catch (error) {
      console.error("MIDI access denied:", error);
    }
  },

  panicSendAllNotesOff() {
    this.outputs.forEach((output) => {
      for (let channel = 0; channel < 16; channel++) {
        try {
          this.logToWindow(
            "Sending All Notes Off to " + output.name,
            "warning",
          );
          output?.send([0xb0 + channel, 0x7b, 0]);
          this.logToWindow("Sent All Notes Off to " + output.name, "warning");
        } catch (err) {
          this.logToWindow(
            "Failed to send All Notes Off to " + output.name,
            "error",
          );
        }
      }
    });
  },

  updateDeviceLists() {
    this.inputs = Array.from(this.midiAccess.inputs.values());
    this.outputs = Array.from(this.midiAccess.outputs.values());
  },

  addRow() {
    this.rows.push({
      id: generateRandomID(),
      inputId: "",
      outputId: "",
      inputChannel: "all",
      outputChannel: 1,
      color: null,
    });
    this.saveConnections();
  },

  removeRow(index) {
    this.disconnectMIDIPort(
      this.rows[index].inputId,
      this.rows[index].outputId,
    );
    this.rows.splice(index, 1);
    this.saveConnections();
  },

  cloneRow(index) {
    const originalRow = this.rows[index];
    const newRow = JSON.parse(JSON.stringify(originalRow)); // Deep clone
    newRow.id = generateRandomID(); // Assign a new ID
    this.rows.splice(index + 1, 0, newRow);
    this.saveConnections();
    this.updateConnections();
    this.persistState();
  },

  cloneRowAndAdjustChannel(index, adjustment, direction = "input") {
    const originalRow = this.rows[index];
    const newRow = JSON.parse(JSON.stringify(originalRow)); // Deep clone
    newRow.id = generateRandomID(); // Assign a new ID

    // Adjust input channel if it's not 'all'
    if (direction === "input" && newRow.inputChannel !== "all") {
      newRow.inputChannel = Math.min(
        Math.max(1, parseInt(newRow.inputChannel) + adjustment),
        16,
      );
    }
    if (direction === "output") {
      newRow.outputChannel = Math.min(
        Math.max(1, parseInt(newRow.outputChannel) + adjustment),
        16,
      );
    }

    this.rows.splice(index + 1, 0, newRow);
    this.saveConnections();
    this.updateConnections();
  },

  updateConnection(index) {
    console.log("Updating connection", index);
    const row = this.rows[index];
    this.disconnectMIDIPort(row.inputId, row.outputId);
    if (row.inputId && row.outputId) {
      this.connectMIDIPorts(
        row.inputId,
        row.outputId,
        row.inputChannel,
        row.outputChannel,
      );
    }
    this.saveConnections();
  },

  connectMIDIPorts(inputId, outputId, inputChannel, outputChannel) {
    const input = this.midiAccess.inputs.get(inputId);
    const output = this.midiAccess.outputs.get(outputId);

    if (input && output) {
      const connection = {
        input: input,
        output: output,
        inputChannel: inputChannel,
        outputChannel: outputChannel,
        onMidiEvent: (event) => {
          const [status, data1, data2] = event.data;
          const channel = status & 0xf;
          const messageType = status >> 4;

          if (
            inputChannel === "all" ||
            channel === parseInt(inputChannel) - 1
          ) {
            let newStatus = (status & 0xf0) | (parseInt(outputChannel) - 1);
            output.send([newStatus, data1, data2]);

            const decodedMessage = this.decodeMIDIMessage(status, data1, data2);
            const logMessage = `Routed: ${input.name} (ch ${channel + 1}) -> ${output.name} (ch ${outputChannel}): ${decodedMessage} | Raw: [${event.data.map((d) => d.toString(16).padStart(2, "0")).join(" ")}] -> [${[newStatus, data1, data2].map((d) => d.toString(16).padStart(2, "0")).join(" ")}]`;
            this.logToWindow(logMessage, "success");
          }
        },
      };

      input.addEventListener("midimessage", connection.onMidiEvent);
      this.connections.push(connection);
    }
  },

  disconnectMIDIPort(inputId, outputId) {
    const connectionIndex = this.connections.findIndex(
      (conn) => conn.input.id === inputId && conn.output.id === outputId,
    );
    if (connectionIndex !== -1) {
      const connection = this.connections[connectionIndex];
      connection.input.removeEventListener(
        "midimessage",
        connection.onMidiEvent,
      );
      this.connections.splice(connectionIndex, 1);
    }
  },

  setupGlobalMIDIListeners() {
    this.midiAccess.inputs.forEach((input) => {
      input.addEventListener("midimessage", (event) => {
        const [status, data1, data2] = event.data;
        const decodedMessage = this.decodeMIDIMessage(status, data1, data2);
        const logMessage = `${input.name}: ${decodedMessage} \t|\t Raw: [${event.data.map((d) => d.toString(16).padStart(2, "0")).join(" ")}]`;
        console.log(logMessage);
        this.logToWindow(logMessage, "info");
      });
    });
  },

  decodeMIDIMessage(status, data1, data2) {
    const channel = (status & 0xf) + 1;
    const messageType = status >> 4;

    switch (messageType) {
      case 0x8:
        return `Ch: ${channel} - Note Off: Note ${data1}, Velocity ${data2}`;
      case 0x9:
        return `Ch: ${channel} - Note On: Note ${data1}, Velocity ${data2}`;
      case 0xa:
        return `Ch: ${channel} - Polyphonic Aftertouch: Note ${data1}, Pressure ${data2}`;
      case 0xb:
        return `Ch: ${channel} - Control Change: Controller ${data1}, Value ${data2}`;
      case 0xc:
        return `Ch: ${channel} - Program Change: Program ${data1}`;
      case 0xd:
        return `Ch: ${channel} - Channel Aftertouch: Pressure ${data1}`;
      case 0xe:
        return `Ch: ${channel} - Pitch Bend: Value ${(data2 << 7) + data1}`;
      default:
        return `Unknown: Status ${status.toString(16)}, Data [${data1}, ${data2}]`;
    }
  },

  clearLog() {
    this.logMessages = [];

    console.log(`[DEBUG] ---------- Cleared log ----------`);
  },

  logToWindow(message, type = "info") {
    if (type === "debug" && !this.debug) {
      return;
    }

    const entry = {
      timestamp: new Date().toISOString(),
      message: message,
      type: type,
    };

    console.log(`[DEBUG] ${entry.message}`);

    this.logMessages.push(entry);

    this.$nextTick(() => {
      this.scrollToBottom();
    });
  },

  scrollToBottom() {
    this.$refs.logWindow.scrollTop = this.$refs.logWindow.scrollHeight;
  },

  toggleConsole() {
    this.consoleOpen = !this.consoleOpen;
  },

  toggleDarkMode() {
    this.darkMode = !this.darkMode;
    localStorage.setItem("darkMode", this.darkMode);
  },

  loadDarkModePreference() {
    const savedDarkMode = localStorage.getItem("darkMode");
    if (savedDarkMode !== null) {
      this.darkMode = JSON.parse(savedDarkMode);
    }
  },

  saveConnections() {
    const connectionsToSave = this.rows.map((row) => ({
      id: row.id,
      inputId: row.inputId,
      outputId: row.outputId,
      inputChannel: row.inputChannel,
      outputChannel: row.outputChannel,
    }));
    localStorage.setItem("midiConnections", JSON.stringify(connectionsToSave));
  },

  loadConnections() {
    const savedConnections = localStorage.getItem("midiConnections");
    if (savedConnections) {
      this.rows = JSON.parse(savedConnections);
      this.updateConnections();
    }
  },

  updateConnections() {
    this.connections = [];
    this.rows.forEach((row, index) => {
      this.logToWindow("Reconnecting row " + index, "debug");

      if (row.inputId && row.outputId) {
        this.connectMIDIPorts(
          row.inputId,
          row.outputId,
          row.inputChannel,
          row.outputChannel,
        );
      }
    });
  },
});
