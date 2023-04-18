import React, { FC } from "react";
import Navbar from "~/components/Navbar";

type LayoutProps = {
  children: React.ReactNode;
};

const Layout: FC<LayoutProps> = ({ children }) => {
  return (
    <>
      <Navbar />
      <main
        className={"h-screen flex overflow-hidden bg-gray-50 dark:bg-gray-900"}
      >
        <div className={"p-2"}>{children}</div>
      </main>
    </>
  );
};

export default Layout;
