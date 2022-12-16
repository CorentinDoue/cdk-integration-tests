import { Bus } from "typebridge";
import { EventBridgeClient } from "@aws-sdk/client-eventbridge";

export const eventBus = new Bus({
  name: process.env.EVENT_BUS_NAME ?? "NeverUsed",
  EventBridge: new EventBridgeClient({}),
});
