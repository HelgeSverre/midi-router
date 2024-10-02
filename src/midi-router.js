export default () => ({
  debug: true,
  midiAccess: null,
  inputs: [],
  outputs: [],
  rows: [],
  connections: [],
  logMessages: [],
  darkMode: false,

  async init() {
    this.loadDarkModePreference();
    await this.initializeMIDI();
    this.loadConnections();

    const debugMessage = () => {
      const status = 0x90;
      const data1 = Math.floor(Math.random() * 127);
      const data2 = Math.floor(Math.random() * 127);
      const decodedMessage = this.decodeMIDIMessage(status, data1, data2);

      const logMessage = `Test Event:  ${decodedMessage} | Raw: [${[status, data1, data2].map((d) => d.toString(16).padStart(2, "0")).join(" ")}]`;

      if (Math.random() > 0.75) {
        this.logToWindow(logMessage, "info");
      } else if (Math.random() > 0.5) {
        this.logToWindow(logMessage, "warn");
      } else if (Math.random() > 0.25) {
        this.logToWindow(logMessage, "error");
      } else {
        this.logToWindow(logMessage, "success");
      }

      setTimeout(debugMessage, Math.random() * 600);
    };

    debugMessage();
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

  updateDeviceLists() {
    this.inputs = Array.from(this.midiAccess.inputs.values());
    this.outputs = Array.from(this.midiAccess.outputs.values());
  },

  addRow() {
    this.rows.push({
      inputId: "",
      outputId: "",
      inputChannel: "all",
      outputChannel: 1,
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

  updateConnection(index) {
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
        onmidimessage: (event) => {
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

      input.addEventListener("midimessage", connection.onmidimessage);
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
        connection.onmidimessage,
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
    this.scrollToBottom();
  },

  scrollToBottom() {
    this.$refs.logWindow.scrollTop = this.$refs.logWindow.scrollHeight;
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
    this.logToWindow("Updating connections...", "debug");

    this.connections = [];
    this.rows.forEach((row, index) => {
      this.logToWindow("Updating connection " + index, "debug");

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
