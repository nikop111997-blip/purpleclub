import { Suspense } from "react";

export default async function MobLayout({ children }) {
  return (
    <Suspense fallback={null}>
      {children}
    </Suspense>
  );
}