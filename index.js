import dotenv from 'dotenv';
import express from 'express';
import {
    messagingApi,
    middleware,
} from '@line/bot-sdk';

import { createReminder } from './services/reminder.js';

// load values from .env file
dotenv.config();

const config = {
    channelSecret: process.env.CHANNEL_SECRET,
};

// create LINE SDK client
const client = new messagingApi.MessagingApiClient({
    channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN
});

// create Express app
// about Express itself: https://expressjs.com/
const app = express();

// register a webhook handler with middleware
// about the middleware, please refer to doc
app.post('/callback', middleware(config), (req, res) => {
    Promise
        .all(req.body.events.map(handleEvent))
        .then((result) => res.json(result))
        .catch((err) => {
            console.error(err);
            res.status(500).end();
        });
});

// event handler
async function handleEvent(event) {
    if (event.type !== 'message' || event.message.type !== 'text') {
        // ignore non-text-message event
        return Promise.resolve(null);
    }

    const { text } = event.message;

    console.log(`Received message: ${text}`);

    if (!text.includes('提醒我')) {
        return Promise.resolve(null);
    }

    const replyMessage = await createReminder(text);

    const echo = { type: 'text', text: replyMessage };


    return client.replyMessage({
        replyToken: event.replyToken,
        messages: [echo],
    });
}

// listen on port
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`listening on ${port}`);
});