import { Router } from "express";
import * as incidentController from "../controllers/incident.controller.js";
import validate from "../middleware/validate.js";
import authenticate from "../middleware/auth.js";
import {
  createIncidentSchema,
  updateStatusSchema,
  idParamSchema,
  listIncidentsQuerySchema,
} from "../validators/incident.validator.js";

const router = Router();

// Every incident route requires a valid access token.
router.use(authenticate);

router.post("/", validate(createIncidentSchema), incidentController.create);
router.get("/", validate(listIncidentsQuerySchema, "query"), incidentController.list);
router.get("/:id", validate(idParamSchema, "params"), incidentController.getOne);
router.patch(
  "/:id/status",
  validate(idParamSchema, "params"),
  validate(updateStatusSchema),
  incidentController.updateStatus
);

export default router;
