import React from 'react';

export function AppShell({
  sidebar,
  main,
  rail,
}: {
  sidebar: React.ReactNode;
  main: React.ReactNode;
  rail: React.ReactNode;
}) {
  return (
    <div className="wb-shell">
      <aside className="wb-sidebar flex flex-col gap-6 px-5 py-6">{sidebar}</aside>
      <main className="wb-main">{main}</main>
      <aside className="wb-rail px-5 py-6">{rail}</aside>
    </div>
  );
}
