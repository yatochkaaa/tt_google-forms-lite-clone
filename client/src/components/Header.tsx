import { Link } from "react-router";
import type { ReactNode } from "react";

type HeaderProps = {
  breadcrumb?: string;
  right?: ReactNode;
};

export function Header({ breadcrumb, right }: HeaderProps) {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
      <div className="max-w-2xl mx-auto px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold tracking-tight">
          <Link to="/" className="text-slate-800 hover:text-indigo-600 transition-colors">
            Lite Forms
          </Link>
          {breadcrumb && (
            <>
              <span className="text-slate-300">/</span>
              <span className="text-slate-500 font-normal truncate max-w-48">
                {breadcrumb}
              </span>
            </>
          )}
        </div>
        {right}
      </div>
    </header>
  );
}
