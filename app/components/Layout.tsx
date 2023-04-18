import React, { FC } from "react";
import Navbar from "~/components/Navbar";
import Sidebar from "~/components/Sidebar";
import {SidebarProvider} from "~/components/SidebarContext";

type LayoutProps = {
  children: React.ReactNode;
};

const Layout: FC<LayoutProps> = ({ children }) => {
  return (
    <SidebarProvider>
      <Navbar />
      <div className={"h-screen flex pt-16 overflow-hidden bg-gray-50 dark:bg-gray-900"}>
        <Sidebar />
        <div
          className={
            "relative w-full h-full overflow-y-auto bg-gray-50 lg:ml-64 dark:bg-gray-900"
          }
        >
          <main>
            <div className={"px-4 pt-6"}>{children}</div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Layout;
