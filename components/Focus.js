import { getDB } from "../lib/db.js";
import { Api } from "telegram";

export class Focus {
    constructor(userId, currentStatus) {
        this.userId = userId;
        this.currentStatus = currentStatus;
    }
    async update(client, newStatus = false) {
        const folders = (await client.invoke(new Api.messages.GetDialogFilters())).filters;
        this.setStatusFolders(folders);
        if (newStatus) {
            await client.invoke(new Api.account.UpdateEmojiStatus({
                emojiStatus: new Api.EmojiStatus({ documentId: this.currentStatus.value })
            }));
        }
        return;
    }
    async setStatus(newStatus, client) {
        this.currentStatus = newStatus;
        const statusFolders = await this.getStatusList();
        if (!statusFolders.some(status => status?.value?.toString() === newStatus?.value?.toString())) {
            return;
        }
        const currentFolders = await this.getCurrentStatusFolders(client, true);
        await this.removeFolders(client, currentFolders);

        const folders = (await this.getStatusFolders()).filter(folder => folder.id).map(folder => folder.originalArgs);
        await this.createFolders(client, folders);
        const orderedFolders = await this.getStatusFolders(true);
        this.orderFolders(client, orderedFolders);
    }
    getStatus() {
        return this.currentStatus;
    }
    getUserId() {
        return this.userId;
    }
    async removeFolders(client, [...ids]) {
        for (const id of ids) {
            await client.invoke(new Api.messages.UpdateDialogFilter({
                id,
                filter: undefined
            }));
        }
    }
    async createFolders(client, [...folders]) {
        for (let folder of folders) {
            folder = this.fixPeers(folder);
            await client.invoke(new Api.messages.UpdateDialogFilter({
                id: folder.id,
                filter: new Api.DialogFilter(folder)
            }));
        }
    }
    async orderFolders(client, [...ids]) {
        await client.invoke(new Api.messages.UpdateDialogFiltersOrder({
            order: ids
        }));
    }
    async getStatusList() {
        const db = await getDB();
        const collection = await db.collection("statusList");
        const user = await collection.findOne({ userId: this.userId });
        if (!user) {
            return [];
        }
        return user.statusList;
    }
    async addStatus(newStatus) {
        const db = await getDB();
        const collection = await db.collection("statusList");
        const user = await collection.findOne({ userId: this.userId });
        if (!user) {
            await collection.insertOne({ userId: this.userId, statusList: [newStatus] });
        } else {
            const statusList = user.statusList;
            if (statusList.some(status => status.value.toString() === newStatus.value.toString())) {
                return;
            }
            await collection.updateOne({ userId: this.userId }, { $push: { statusList: newStatus } });
        }
    }
    async removeStatus(status) {
        const db = await getDB();
        const collection = await db.collection("statusList");
        const user = await collection.findOne({ userId: this.userId });
        if (!user) {
            return;
        }
        await collection.updateOne({ userId: this.userId }, { $pull: { statusList: status } });
    }

    async getStatusFolders(order = false) {
        const db = await getDB();
        const collection = await db.collection("statusFolders");
        const savedStatus = await collection.findOne({ status: this.currentStatus });
        if (!savedStatus) {
            return [];
        }
        if (order) {
            return savedStatus.folders.map(folder => folder.id)
        }
        return savedStatus.folders;
    }

    async getCurrentStatusFolders(client, idOnly = false) {
        const folders = (await client.invoke(new Api.messages.GetDialogFilters())).filters;
        if (idOnly) {
            return folders.map(folder => folder.id).filter(id => id);
        }
        return folders;
    }

    async setStatusFolders(folders) {
        const status = this.getStatus();
        const statusList = await this.getStatusList();
        if (!statusList.some(oldstatus => oldstatus?.value?.toString() === status?.value?.toString())) {
            this.addStatus(status);
        }
        folders = folders.map(folder => {
            if (!folder.id) {
                return { ...folder, id: 0 };
            }
            return folder;
        });
        const db = await getDB();
        const collection = await db.collection("statusFolders");
        const savedStatus = await collection.findOne({ status: status });
        if (!savedStatus) {
            await collection.insertOne({ status: status, folders: folders });
        } else {
            await collection.updateOne({ status: status }, { $set: { folders: folders } });
        }
    }
    fixPeers(folder) {
        const fixer = (peer) => {
            if (peer.userId) {
                return new Api.InputPeerUser({ userId: peer.userId.value });
            }
            else if (peer.chatId) {
                return new Api.InputPeerChat({ chatId: peer.chatId.value });
            }
            else if (peer.channelId) {
                return new Api.InputPeerChannel({ channelId: peer.channelId.value });
            }
            return peer;
        }
        if (folder.pinnedPeers) {
            folder.pinnedPeers = folder.pinnedPeers.map(peer => {
                return fixer(peer);
            });
        }
        if (folder.includePeers) {
            folder.includePeers = folder.includePeers.map(peer => {
                return fixer(peer);
            });
        }
        if (folder.excludePeers) {
            folder.excludePeers = folder.excludePeers.map(peer => {
                return fixer(peer);
            });
        }
        return folder;
    }
}