// The mock loads React 18 as a UMD global from cdnjs; app code imports "react" as usual.
const R = (window as unknown as { React: typeof import("react") }).React;
export default R;
export const {
  Children,
  Fragment,
  StrictMode,
  Suspense,
  createContext,
  createElement,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} = R;
