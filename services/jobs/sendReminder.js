import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import lineNotifyNodejs from "line-notify-nodejs";
import dayjs from "dayjs";
import utc from 'dayjs/plugin/utc.js'
import timezone from 'dayjs/plugin/timezone.js'
dayjs.extend(utc)
dayjs.extend(timezone)

// load values from .env file
dotenv.config();

const notify = lineNotifyNodejs(process.env.LINE_NOTIFY_TOKEN);

const prisma = new PrismaClient();


export default async function sendReminder() {

    const fromTime = dayjs().tz("Asia/Taipei").toDate();
    const endTime = dayjs().tz("Asia/Taipei").add(2, 'second').toDate();

    const tasks = await prisma.task.findMany({
        where: {
            datetime: {
                gte: fromTime,
                lte: endTime
            },
            is_send: false
        }
    });

    for (const task of tasks) {
        console.log(`Sending reminder for task: ID: ${task.id} Title: ${task.title}`);
        notify.notify({
            message: `\n提醒：${task.title}\n日期：${dayjs(task.datetime).tz("Asia/Taipei").format("YYYY-MM-DD HH:mm:ss")}`
        });

        await prisma.task.update({
            where: {
                id: task.id
            }, data: {
                is_send: true
            }
        });
    }

}