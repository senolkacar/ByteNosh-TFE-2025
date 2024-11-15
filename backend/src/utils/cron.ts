import cron from "node-cron";
import Waitlist from "../models/waitlist";
import Table from "../models/table";
import { notifyCustomer } from "./notify-customer";

cron.schedule("*/5 * * * *", async () => {
    try {
        const availableTable = await Table.findOne({ status: "AVAILABLE" });
        if (!availableTable) return;

        const nextInWaitlist = await Waitlist.findOneAndUpdate(
            { status: "WAITING" },
            { status: "NOTIFIED" },
            { new: true }
        );

        if (nextInWaitlist) {
            await notifyCustomer(nextInWaitlist.contact, "A table is now available!");
        }
    } catch (error) {
        console.error("Cron job failed:", error);
    }
});
