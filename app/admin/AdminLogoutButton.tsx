"use client";

import { adminLogout } from "./actions";
import { LogOut } from "lucide-react";

export default function AdminLogoutButton() {
  return (
    <form action={adminLogout}>
      <button
        type="submit"
        className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors"
      >
        <LogOut size={15} />
        Sign Out
      </button>
    </form>
  );
}
