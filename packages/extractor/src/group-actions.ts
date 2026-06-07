import { ActionItem } from "./types";

export function groupActionsByOwner(actions: ActionItem[]): Record<string, ActionItem[]> {
  return actions.reduce<Record<string, ActionItem[]>>((acc, action) => {
    const owner = action.owner ?? "Unassigned";
    acc[owner] = acc[owner] ?? [];
    acc[owner].push(action);
    return acc;
  }, {});
}
