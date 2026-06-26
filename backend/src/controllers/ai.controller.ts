import asyncHandler from "../utils/asyncHandler.js";
import * as aiService from "../services/ai.service.js";
import { getIncidentById, getIncidentContext } from "../services/incident.service.js";

export const summary = asyncHandler(async (req, res) => {
  const incident = await getIncidentById(req.params.id);
  const out = await aiService.summarize(incident);
  res.status(200).json({ data: out });
});

export const rootCause = asyncHandler(async (req, res) => {
  const incident = await getIncidentById(req.params.id);
  const out = await aiService.suggestRootCause(incident);
  res.status(200).json({ data: out });
});

export const severity = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  const out = await aiService.recommendSeverity(title, description);
  res.status(200).json({ data: out });
});

export const chat = asyncHandler(async (req, res) => {
  const context = await getIncidentContext();
  const out = await aiService.chatAssistant(req.body.messages, context);
  res.status(200).json({ data: out });
});
