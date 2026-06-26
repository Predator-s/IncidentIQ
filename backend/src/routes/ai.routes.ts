import { Router } from "express";
import * as aiController from "../controllers/ai.controller.js";
import validate from "../middleware/validate.js";
import authenticate from "../middleware/auth.js";
import { idParamSchema } from "../validators/incident.validator.js";
import { severitySuggestSchema, chatSchema } from "../validators/ai.validator.js";

const router = Router();

// All AI routes require a valid access token.
router.use(authenticate);

router.post("/severity", validate(severitySuggestSchema), aiController.severity);
router.post("/chat", validate(chatSchema), aiController.chat);
router.get("/incidents/:id/summary", validate(idParamSchema, "params"), aiController.summary);
router.get("/incidents/:id/root-cause", validate(idParamSchema, "params"), aiController.rootCause);

export default router;
