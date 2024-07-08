import dotenv from "dotenv";
import OpenAI from "openai";
import dayjs from "dayjs";
import utc from 'dayjs/plugin/utc.js'
import timezone from 'dayjs/plugin/timezone.js'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient();

dayjs.extend(utc)
dayjs.extend(timezone)

dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const getPrompt = (userText) => `
${userText}

以上是使用者傳來的訊息，你是一個幫我把用戶訊息轉換成JSON格式的工具，方便我存入資料庫，請將使用者的提醒內容序列化成以下 JSON 格式：\n\n
現在日期時間： ${dayjs().tz("Asia/Taipei").format("YYYY-MM-DD HH:mm:ss")}
{
    title: "提醒內容",
    date: "提醒日期和時間請參考我給你的時間並與使用者給你的時間描述做參考，給我使用者期望的時間，並給我 timestamp 格式，時區為台北時區。",
}
請給我一個 JSON 格式的提醒內容並嚴格遵守格式，並不要輸出其他多餘的訊息。

!!如果使用者的內容不足以產生 JSON 格式，像是他只給了提醒我三個字但卻沒有給予時間(時間一定是要未來)，或是只給予時間沒給予事件，並直接回覆使用者說明需要的資訊，不要回覆我 JSON。。!!
`;

export async function createReminder(userText) {
    console.log(dayjs().tz("Asia/Taipei").format("YYYY-MM-DD HH:mm:ss"));
    const completion = await openai.chat.completions.create({
        messages: [{ role: "system", content: getPrompt(userText) }],
        model: "gpt-4o",
    });

    let obj = null;

    const response = completion.choices[0].message.content;
    console.log("GPT response: ", response);
    try {
        obj = JSON.parse(response.replace("```json\n", "").replace("```", ""))
        await prisma.task.create({
            data: {
                title: obj.title,
                datetime: obj.date,
            }
        })
    } catch (e) {
        console.log(e);
        return completion.choices[0].message.content
    }

    return `提醒已建立：\n\n提醒內容：${obj.title}\n日期：${dayjs(obj.date).tz("Asia/Taipei").format("YYYY-MM-DD HH:mm:ss")}`
}