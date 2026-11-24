import { useState } from "react";

/** True when the first render had no data, i.e. the content will replace a skeleton. */
export function useLoadedLate(ready: boolean) {
  const [late] = useState(!ready);
  return late;
}
