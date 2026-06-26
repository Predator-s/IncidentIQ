import { render, screen } from "@testing-library/react";
import { describe, test, expect } from "vitest";
import Badge from "./Badge";
import FilterBar from "./FilterBar";
import type { IncidentFilters } from "../types";

describe("Badge", () => {
  test("renders severity label", () => {
    render(<Badge kind="severity" value="CRITICAL" />);
    expect(screen.getByText("CRITICAL")).toBeInTheDocument();
  });

  test("humanizes status with underscore", () => {
    render(<Badge kind="status" value="IN_PROGRESS" />);
    expect(screen.getByText("IN PROGRESS")).toBeInTheDocument();
  });
});

describe("FilterBar", () => {
  const filters: IncidentFilters = {
    search: "",
    severity: "",
    status: "",
    page: 1,
    pageSize: 10,
  };

  test("renders search, severity and status controls", () => {
    render(<FilterBar filters={filters} onChange={() => {}} />);
    expect(screen.getByPlaceholderText(/search title/i)).toBeInTheDocument();
    expect(screen.getByText("Severity")).toBeInTheDocument();
    expect(screen.getByText("Status")).toBeInTheDocument();
  });
});
