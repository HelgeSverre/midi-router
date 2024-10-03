# 🎹↯ MIDI Router

![MIDI Router Logo](https://via.placeholder.com/1200x300.png?text=MIDI+Router)

MIDI Router is a web-based application that allows you to route MIDI messages between different input and output
devices. It's perfect for musicians, producers, and anyone working with MIDI-enabled hardware or software.

## Features

- 🎹 Connect multiple MIDI inputs to multiple MIDI outputs
- 🎛️ Channel-specific routing
- 🌓 Dark mode support
- 📊 Real-time MIDI event logging
- 💾 Automatic saving of routing configurations
- 🎨 Color-coded connections for easy visual organization
- 🔄 Clone and adjust routing configurations quickly

## 🖥️ Demo

[View Live Demo](https://midi-router.vercel.app/)

![MIDI Router Screenshot](./art/screenshot.png)

## 🚀 Getting Started

### Prerequisites

- A web browser that supports the Web MIDI API (e.g., Chrome, Edge)
- MIDI devices (input and/or output)

### Hosted version

The application is hosted on Vercel. You can access it at the following URL:

> 🔗 [https://midi-router.vercel.app/](https://midi-router.vercel.app/)

## 🎛️ Usage

1. Connect your MIDI devices to your computer.
2. Open the MIDI Router application in your web browser.
3. Grant MIDI access when prompted by the browser.
4. Use the interface to create routing configurations:
   - Select input devices and channels
   - Choose output devices and channels
   - Add, remove, or clone routing connections as needed
   - Use color-coding to organize your connections visually
5. Monitor MIDI activity in real-time using the built-in event logger.
6. Your configurations will be automatically saved for future sessions.

## 🛠️ Development

```shell
git clone https://github.com/HelgeSverre/midi-router.git

cd midi-router

# Install dependencies
yarn install

# Start the development server
yarn dev

# Build the project
yarn build

# Format the code
yarn format
```

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. Fork the repository
2. Create a new branch (`git checkout -b feature/AmazingFeature`)
3. Make your changes
4. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
5. Push to the branch (`git push origin feature/AmazingFeature`)
6. Open a Pull Request

Please ensure your code adheres to the existing style and passes any tests.

## 🐛 Troubleshooting

If you encounter issues:

1. Ensure your browser supports the Web MIDI API
2. Check that your MIDI devices are properly connected and recognized by your computer
3. Clear your browser cache and reload the page
4. Check the console for any error messages

If you're still having trouble, please [open an issue](https://github.com/HelgeSverre/midi-router/issues) on our GitHub
repository.

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE.md) file for details.
