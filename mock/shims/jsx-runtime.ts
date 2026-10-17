import React from "react";

// Automatic JSX runtime on top of React.createElement (UMD React has no jsx-runtime).
type Props = Record<string, unknown> | null;
export function jsx(type: React.ElementType, props: Props, key?: React.Key) {
  return React.createElement(type, key === undefined ? props : { ...props, key });
}
export const jsxs = jsx;
export const Fragment = React.Fragment;
