import asyncHandler from "../utils/asyncHandler.js";
import * as authService from "../services/auth.service.js";

export const register = asyncHandler(async (req, res) => {
  const result = await authService.register(req.body);
  res.status(201).json({ data: result });
});

export const login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body);
  res.status(200).json({ data: result });
});

export const refresh = asyncHandler(async (req, res) => {
  const result = await authService.refresh(req.body);
  res.status(200).json({ data: result });
});

export const logout = asyncHandler(async (req, res) => {
  await authService.logout(req.user!.id);
  res.status(200).json({ data: { message: "Logged out" } });
});

export const me = asyncHandler(async (req, res) => {
  res.status(200).json({ data: { user: req.user } });
});
