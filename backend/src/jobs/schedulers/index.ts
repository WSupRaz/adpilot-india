import { startCreditResetScheduler } from "./creditReset.scheduler";
import { logger } from "../../lib/logger";

export function startSchedulers() {
  startCreditResetScheduler();
  logger.info("Schedulers started");
}
