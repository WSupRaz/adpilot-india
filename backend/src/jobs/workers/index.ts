import "./campaign.worker";
import "./audit.worker";
import "./creative.worker";
import "./competitor.worker";
import "./growth.worker";
import "./pdf.worker";
import "./whatsapp.worker";

export function startWorkers() {
  // Workers start when modules are imported above
  console.log("BullMQ workers started");
}
