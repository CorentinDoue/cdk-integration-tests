import { Bus } from "typebridge";
import { EventBridgeClient } from "@aws-sdk/client-eventbridge";
import { Config } from "../config";

export const eventBus = new Bus({
  name: Config.EVENT_BUS_NAME,
  EventBridge: new EventBridgeClient({}),
});
