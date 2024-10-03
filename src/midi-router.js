import { bytesToHex, generateRandomID } from "@/utils.js";

const MIDI_ROUTER_STATE_KEY = "midi-router-state";
const MIDI_ROUTER_CONNECTIONS_KEY = "midi-router-connections";

export default () => {
  return {
    debug: false,
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
      await this.initializeMIDI();
      this.loadDarkModePreference();
      this.loadConnections();
      this.restoreState();

      if (this.rows.length === 0) {
        this.logToWindow("No connections found, adding initial row", "debug");
        this.addRow();
      }

      // this.initDemoContent();
      // this.dummyLogger();
      this.setupWatchers();
    },

    setupWatchers() {
      this.$watch(
        "rows",
        () => {
          this.persistState();
          this.saveConnections();
        },
        { deep: true },
      );

      this.$watch("debug", () => this.persistState());
      this.$watch("darkMode", () => this.persistState());
      this.$watch("consoleOpen", () => this.persistState());
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

      this.updateConnections();
    },

    clearPersistedState() {
      this.rows = [];
      this.connections = [];
      this.logMessages = [];
      localStorage.removeItem(MIDI_ROUTER_STATE_KEY);
      localStorage.removeItem(MIDI_ROUTER_CONNECTIONS_KEY);

      this.logToWindow("---------- Cleared saved data ----------", "debug");
    },

    persistState() {
      localStorage.setItem(
        MIDI_ROUTER_STATE_KEY,
        JSON.stringify({
          rows: this.rows,
          debug: this.debug,
          darkMode: this.darkMode,
          consoleOpen: this.consoleOpen,
        }),
      );

      this.logToWindow("Persisted state to local storage", "debug");
    },

    restoreState() {
      const savedState = localStorage.getItem(MIDI_ROUTER_STATE_KEY);
      if (savedState) {
        const loaded = JSON.parse(savedState);
        this.rows = loaded.rows ?? [];
        this.debug = loaded.debug ?? false;
        this.darkMode = loaded.darkMode ?? false;
        this.consoleOpen = loaded.consoleOpen ?? false;

        this.logToWindow("Restored state from local storage", "debug");
      } else {
        this.logToWindow("No state found in local storage", "debug");
      }
    },

    dummyLogger() {
      const status =
        Math.floor(Math.random() * 16) * 16 + Math.floor(Math.random() * 16);
      const data1 = Math.floor(Math.random() * 127);
      const data2 = Math.floor(Math.random() * 127);
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

      const hex = bytesToHex([status, data1, data2]);

      const suffix = `| Raw: [${hex}]`;
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
        this.midiAccess.onstatechange = this.updateMIDIState;
        this.setupGlobalMIDIListeners();
      } catch (error) {
        console.error("MIDI access denied:", error);
      }
    },

    updateMIDIState() {
      this.updateDeviceLists();
      this.updateConnections();
    },

    panicSendAllNotesOff() {
      this.logToWindow(
        "--- Panic: Sending All Notes Off to all outputs",
        "alert",
      );

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
      this.logToWindow("--- Panic complete", "alert");
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
    },

    removeRow(index) {
      const row = this.rows[index];
      this.disconnectMIDIPort(row.id);
      this.rows.splice(index, 1);
    },

    cloneRow(index) {
      const originalRow = this.rows[index];
      const newRow = JSON.parse(JSON.stringify(originalRow)); // Deep clone
      newRow.id = generateRandomID(); // Assign a new ID
      this.rows.splice(index + 1, 0, newRow);

      this.updateConnections();
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

      this.updateConnections();
    },

    updateConnection(index) {
      const row = this.rows[index];
      this.logToWindow(
        `Updating connection on row ${index} - ${row.id}`,
        "info",
      );
      this.disconnectMIDIPort(row.id);

      if (row.inputId && row.outputId) {
        this.logToWindow(
          `Connecting ${row.inputId} to ${row.outputId} - on row ${index}`,
          "info",
        );

        this.connectMIDIPorts(
          row.inputId,
          row.outputId,
          row.inputChannel,
          row.outputChannel,
          row.id,
        );
      } else {
        this.logToWindow(
          `Skipping connection for row ${index} (${row.id}) : ${row.inputId || ":none:"} -> ${row.outputId || ":none:"} (row ${index}) - missing port`,
          "debug",
        );
      }
    },

    connectMIDIPorts(inputId, outputId, inputChannel, outputChannel, rowId) {
      const input = this.midiAccess.inputs.get(inputId);
      const output = this.midiAccess.outputs.get(outputId);

      if (input && output) {
        const connection = {
          input,
          inputId,
          output,
          outputId,
          inputChannel,
          outputChannel,
          rowId,
          onMidiEvent: (event) => {
            const [status, data1, data2] = event.data;
            const channel = status & 0x0f;

            if (
              inputChannel === "all" ||
              channel === parseInt(inputChannel) - 1
            ) {
              const newStatus = (status & 0xf0) | (parseInt(outputChannel) - 1);
              output.send([newStatus, data1, data2]);

              const hexIn = bytesToHex(event.data);
              const hexOut = bytesToHex([newStatus, data1, data2]);

              const decodedMessage = this.decodeMIDIMessage(event.data);
              const logMessage = `Routed: ${input.name} (ch ${channel + 1}) -> ${output.name} (ch ${outputChannel}): ${decodedMessage} | Raw: [${hexIn}] -> [${hexOut}]`;
              this.logToWindow(logMessage, "success");
            }
          },
        };
        input.addEventListener("midimessage", connection.onMidiEvent);
        this.connections.push(connection);
      }
    },

    disconnectMIDIPort(rowId) {
      const connectionIndex = this.connections.findIndex(
        (conn) => conn.rowId === rowId,
      );
      if (connectionIndex !== -1) {
        const connection = this.connections[connectionIndex];

        const input = this.midiAccess.inputs.get(connection.inputId);
        const output = this.midiAccess.outputs.get(connection.outputId);

        input.removeEventListener("midimessage", connection.onMidiEvent);
        this.connections.splice(connectionIndex, 1);
      }
    },

    setupGlobalMIDIListeners() {
      this.midiAccess.inputs.forEach((input) => {
        input.addEventListener("midimessage", (event) => {
          const decodedMessage = this.decodeMIDIMessage(event.data);
          const hex = bytesToHex(event.data);
          const logMessage = `${input.name}: ${decodedMessage} \t|\t Raw: [${hex}]`;

          this.logToWindow(logMessage, "info");
        });
      });
    },

    decodeMIDIMessage(data) {
      const [status, data1, data2] = data;
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

    toggleDebug() {
      this.debug = !this.debug;

      if (this.debug) {
        console.log("✅ MIDI Router Developer Mode enabled");
      } else {
        console.log("❌ MIDI Router Developer Mode disabled");
      }
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
      localStorage.setItem(
        MIDI_ROUTER_CONNECTIONS_KEY,
        JSON.stringify(connectionsToSave),
      );
    },

    loadConnections() {
      const savedConnections = localStorage.getItem(
        MIDI_ROUTER_CONNECTIONS_KEY,
      );
      if (savedConnections) {
        this.rows = JSON.parse(savedConnections);
        this.updateConnections();
      }
    },

    updateConnections() {
      this.rows.forEach((row, index) => {
        if (row.inputId && row.outputId) {
          this.logToWindow(
            "Reconnecting connection: " + row.inputId + " -> " + row.outputId,
            "info",
          );
          this.disconnectMIDIPort(row.id);
          this.connectMIDIPorts(
            row.inputId,
            row.outputId,
            row.inputChannel,
            row.outputChannel,
            row.inputId,
            row.id,
          );
        } else {
          this.logToWindow(
            `Skipping connection for row ${index} (${row.id}) : ${row.inputId || ":none:"} -> ${row.outputId || ":none:"} (row ${index}) - missing port`,
            "debug",
          );
        }
      });
    },
  };
};
