import schedule from 'node-schedule'
import sendReminder from './services/jobs/sendReminder.js';

function job() {
    // Run every second
    schedule.scheduleJob('*/1 * * * * *', async function () {
        await sendReminder();
    });
}

job();