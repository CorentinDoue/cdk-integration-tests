import { EventBus } from "./EventBus";
import { Table } from "./Table";
import { Queue } from "./Queue";

export type TestableDependency = EventBus | Table | Queue;
