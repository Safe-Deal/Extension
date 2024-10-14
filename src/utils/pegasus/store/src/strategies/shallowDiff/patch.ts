import { handleError } from "@utils/analytics/logger";
import { StateDiff } from "../../types";
import { ChangeType } from "../constants";

export function shallowPatch<S>(obj: S, difference: StateDiff): S {
  // @ts-expect-error: TypeScript cannot infer the type of newObj from the initial value
  const newObj: { [key: string]: unknown } = { ...obj };

  difference.forEach(({ change, key, value }) => {
    switch (change) {
      case ChangeType.UPDATED:
        newObj[key] = value as S;
        break;

      case ChangeType.REMOVED:
        Reflect.deleteProperty(newObj, key);
        break;

      default:
        handleError(new Error(`Unknown change type ${change} for key ${key} (value: ${value})`));
    }
  });

  return newObj as S;
}
