# FucoMoji

FucoMoji is a userbot built using gramjs for Telegram accounts, designed to streamline folder management based on the status emoji set on the account. With FucoMoji, users can effortlessly organize their Telegram folders according to their designated emoji statuses.

## Features

- **Emoji-Based Folder Management**: Automatically categorize chats into different sets of folders based on the status emoji set for the account.
- **Easy Integration**: Integrate FucoMoji seamlessly into your existing Telegram workflow.
- **Infinite Folders Activated**: By this tool, you can have infinite folders packed in 10 (20 for premium) folders for each status.

## Getting Started

To get started with FucoMoji, follow these steps:

1. **Clone the Repository**: Clone the FucoMoji repository to your local machine or server (server is preferred).

```bash
git clone https://github.com/meh7an/FucoMoji.git
```

2. **Install Dependencies**: Navigate to the project directory and install the necessary dependencies.

```bash
cd FucoMoji
npm i
```

3. **Configuration**: Open the `.env.local` file and provide the required information:

   - `API_ID` and `API_HASH`: Obtain these from [my.telegram.org](https://my.telegram.org).
   - `MONGODB_URI`: URI for your MongoDB database.
   - `SESSION_STRING`: gramjs session string.

4. **Run FucoMoji**: Once configured, run FucoMoji.

```bash
node index.js
```

## Usage

To utilize FucoMoji, follow these steps:

1. **Activate FucoMoji**: Choose a desired status emoji and write `/savestatus` in your saved messages. This action transforms the selected emoji into a FucoMoji.

2. **Alternative Method**: Another way to activate a FucoMoji is by adding [this emoji pack](https://t.me/addemoji/ApplyFocus) to your Telegram account. After adding the pack, set the emoji from the pack as your status emoji. This method achieves the same result as using the `/savestatus` command.

3. **Folder Management**: Once a FucoMoji is activated on the Telegram account, any changes made to your folders will be saved for that particular emoji. This allows for seamless organization and retrieval of chats based on emoji statuses.


## Contributing

Contributions are welcome! If you have any suggestions, improvements, or feature requests, feel free to open an issue or create a pull request.

## License

This project is licensed under the [MIT License](LICENSE).
