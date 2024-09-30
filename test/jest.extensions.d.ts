/// <reference types="@testing-library/jest-dom" />

import { UserEvent } from "@testing-library/user-event";

declare global {
  let user: UserEvent;
}

declare namespace jest {
  interface Matchers<R> {
    toExist(): R;
  }
}
