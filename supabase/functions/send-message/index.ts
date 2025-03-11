import { serve } from "std/http/server";
import { SendMessageController } from "./controller.ts";

const controller = new SendMessageController();

serve((req) => controller.handleRequest(req));
