import React, { FC } from "react";
import { NavLink, useMatches } from "@remix-run/react";
import {
  ArrowRightOnRectangleIcon,
  BanknotesIcon,
  ChartPieIcon,
  CreditCardIcon,
  CurrencyDollarIcon,
} from "@heroicons/react/24/solid";
import { Navbar as FlowbiteNavbar } from "flowbite-react";

type NavbarProps = {};

const getActiveProp = (matches: ReturnType<typeof useMatches>) => {
  return (route: string) =>
    matches.filter((match) => match.id.indexOf(route) !== -1).length > 0;
};

const Navbar: FC<NavbarProps> = () => {
  const matches = useMatches();

  const getActive = getActiveProp(matches);

  return (
    <FlowbiteNavbar>
      <FlowbiteNavbar.Brand as={NavLink} to="/">
        <CurrencyDollarIcon className="mr-3 h-6 sm:h-9" />
        <span className="self-center whitespace-nowrap text-xl font-semibold dark:text-white">
          NMB
        </span>
      </FlowbiteNavbar.Brand>
      <FlowbiteNavbar.Toggle />
      <FlowbiteNavbar.Collapse>
        <FlowbiteNavbar.Link
          as={NavLink}
          to="/dashboard"
          active={getActive("dashboard")}
        >
          <span className={"flex items-center justify-start"}>
            <ChartPieIcon className={"w-6 h-6"} />
            <span className="ml-2">Dashboard</span>
          </span>
        </FlowbiteNavbar.Link>
        <FlowbiteNavbar.Link
          as={NavLink}
          to="/transactions/account"
          active={getActive("account")}
        >
          <span className={"flex items-center justify-start"}>
            <BanknotesIcon className={"w-6 h-6"} />
            <span className="ml-2">Account</span>
          </span>
        </FlowbiteNavbar.Link>
        <FlowbiteNavbar.Link
          as={NavLink}
          to="/transactions/credit-card"
          active={getActive("credit-card")}
        >
          <span className={"flex items-center justify-start"}>
            <CreditCardIcon className={"w-6 h-6"} />
            <span className="ml-2">Credit Card</span>
          </span>
        </FlowbiteNavbar.Link>
        <FlowbiteNavbar.Link as={NavLink} to="/logout">
          <span className={"flex items-center justify-start"}>
            <ArrowRightOnRectangleIcon className={"w-6 h-6"} />
            <span className="ml-2">Logout</span>
          </span>
        </FlowbiteNavbar.Link>
      </FlowbiteNavbar.Collapse>
    </FlowbiteNavbar>
  );
};

export default Navbar;
