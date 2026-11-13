const Policy = require('../models/Policy');
const sendEmail = require('./sendEmail');

const REMINDER_EMAIL = 'pnminfotech2024@gmail.com';
const DAY_IN_MS = 24 * 60 * 60 * 1000;

const atUtcMidnight = (value) => {
    const date = new Date(value);
    date.setUTCHours(0, 0, 0, 0);
    return date;
};

const oneMonthBefore = (value) => {
    const dueDate = atUtcMidnight(value);
    const year = dueDate.getUTCFullYear();
    const month = dueDate.getUTCMonth();
    const previousMonthLastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
    return new Date(Date.UTC(year, month - 1, Math.min(dueDate.getUTCDate(), previousMonthLastDay)));
};

const reminderStageForToday = (dueDateValue, today) => {
    const dueDate = atUtcMidnight(dueDateValue);
    const daysBeforeDue = Math.round((dueDate - today) / DAY_IN_MS);

    if (oneMonthBefore(dueDate).getTime() === today.getTime()) {
        return { key: 'one-month', label: 'one month' };
    }
    if (daysBeforeDue === 15) return { key: '15-days', label: '15 days' };
    if (daysBeforeDue === 2) return { key: '2-days', label: '2 days' };
    return null;
};

const checkPoliciesForNotifications = async () => {
    try {
        const today = atUtcMidnight(new Date());
        const policies = await Policy.find({
            paidDate: null,
            dueDate: { $gte: today },
        });

        for (const policy of policies) {
            const stage = reminderStageForToday(policy.dueDate, today);
            if (!stage) continue;

            const alreadySent = (policy.remindersSent || []).some(
                (reminder) => reminder.stage === stage.key
            );
            if (alreadySent) continue;

            const dueDate = atUtcMidnight(policy.dueDate).toLocaleDateString('en-IN');
            await sendEmail(
                REMINDER_EMAIL,
                `${stage.label} payment reminder: ${policy.clientName}`,
                `Client reminder\n\nClient: ${policy.clientName}\nDue date: ${dueDate}\nReminder: ${stage.label} before the due date\nStatus: Payment pending`
            );

            policy.remindersSent.push({ stage: stage.key, sentAt: new Date() });
            await policy.save();
        }
    } catch (error) {
        console.error('Error checking payment reminders:', error);
    }
};

module.exports = checkPoliciesForNotifications;
