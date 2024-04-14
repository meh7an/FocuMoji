import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions/index.js";
import dotenv from "dotenv";
import { Focus } from "./components/Focus.js";
dotenv.config({ path: "./.env.local" });

const stringSession = new StringSession(process.env.SESSION_STRING);

(async () => {
    const client = new TelegramClient(stringSession, parseInt(process.env.API_ID), process.env.API_HASH, {
        connectionRetries: 5,
    });
    await client.start();
    const me = await client.getMe()
    const myId = me.id;
    const currentStatus = await me?.emojiStatus?.documentId;

    const focusObj = new Focus(myId, currentStatus);

    client.addEventHandler(async (update) => {
        if (update.className === "UpdateNewMessage" && update.message.peerId.userId.toString() === myId.toString()) {
            if (update.message.message.toLowerCase() !== "/savestatus") {
                return;
            }
            focusObj.update(client);
            return;
        }
        if (update.className === "UpdateDialogFilterOrder" || update.className === "UpdateDialogFilter" || update.className === "UpdateNotifySettings") {
            focusObj.update(client);
            return;
        }
        if (update.className !== "UpdateUserEmojiStatus" || update.userId.toString() !== myId.toString()) {
            return;
        }
        const status = update?.emojiStatus?.documentId;
        if (status.value.toString() === process.env.APPLY_EMOJI_ID) {
            focusObj.update(client, true);
            return;
        }
        else {
            focusObj.currentStatus = update?.emojiStatus?.documentId;
        }
        focusObj.setStatus(focusObj.getStatus(), client);
    }
    );
})();