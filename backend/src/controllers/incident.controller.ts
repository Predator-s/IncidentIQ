import asyncHandler from "../utils/asyncHandler.js";
import * as incidentService from "../services/incident.service.js";
import type { ListIncidentsQuery } from "../validators/incident.validator.js";

export const create = asyncHandler(async (req, res) => {
  const incident = await incidentService.createIncident(req.body, req.user!.id);
  res.status(201).json({ data: incident });
});

export const list = asyncHandler(async (req, res) => {
  const { items, pagination } = await incidentService.listIncidents(
    req.query as unknown as ListIncidentsQuery
  );
  res.status(200).json({ data: items, pagination });
});

export const getOne = asyncHandler(async (req, res) => {
  const incident = await incidentService.getIncidentById(req.params.id);
  res.status(200).json({ data: incident });
});

export const updateStatus = asyncHandler(async (req, res) => {
  const incident = await incidentService.updateIncidentStatus(
    req.params.id,
    req.body.status,
    req.user!.id
  );
  res.status(200).json({ data: incident });
});
