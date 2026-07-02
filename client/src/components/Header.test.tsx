import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { Header } from "./Header";

const renderHeader = (props: React.ComponentProps<typeof Header> = {}) =>
  render(
    <MemoryRouter>
      <Header {...props} />
    </MemoryRouter>
  );

describe("Header", () => {
  it('renders "Forms" brand link pointing to root', () => {
    renderHeader();
    const link = screen.getByRole("link", { name: "Forms" });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/");
  });

  it("renders without breadcrumb by default", () => {
    renderHeader();
    expect(screen.queryByText("/")).not.toBeInTheDocument();
  });

  it("renders breadcrumb text when provided", () => {
    renderHeader({ breadcrumb: "My Survey" });
    expect(screen.getByText("My Survey")).toBeInTheDocument();
    expect(screen.getByText("/")).toBeInTheDocument();
  });

  it("renders right slot content", () => {
    renderHeader({ right: <button>Save</button> });
    expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
  });

  it("renders both breadcrumb and right slot together", () => {
    renderHeader({
      breadcrumb: "Form Title",
      right: <button>Submit</button>,
    });
    expect(screen.getByText("Form Title")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Submit" })).toBeInTheDocument();
  });
});
