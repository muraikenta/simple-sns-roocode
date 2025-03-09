import { serve } from "std/http/server";
import { CreateConversationController } from "./controller.ts";

const controller = new CreateConversationController();

serve((req) => controller.handleRequest(req));
