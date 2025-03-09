import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { CreateConversationController } from "./controller.ts";

const controller = new CreateConversationController();

serve((req) => controller.handleRequest(req));
