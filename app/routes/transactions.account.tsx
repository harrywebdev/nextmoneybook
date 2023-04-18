import React from "react";
import { requireUserId } from "~/session.server";
import { json, LoaderArgs } from "@remix-run/node";
import Layout from "~/components/Layout";
import { prisma } from "~/db.server";
import { useLoaderData } from "@remix-run/react";
import { TransactionAccountType } from "../../botapp/parse_txs/types";
import { Table } from "flowbite-react";

export async function loader({ request, params }: LoaderArgs) {
  await requireUserId(request);

  const transactions = await prisma.transaction.findMany({
    where: {
      accountType: TransactionAccountType.BankAccount,
    },
  });

  return json({ transactions });
}

export default function TransactionsAccountPage() {
  const { transactions } = useLoaderData<typeof loader>();

  return (
    <Layout>
      <Table striped={true}>
        <Table.Head>
          <Table.HeadCell>offsetAccount</Table.HeadCell>
          <Table.HeadCell>dateCreated</Table.HeadCell>
          <Table.HeadCell>dateCharged</Table.HeadCell>
          <Table.HeadCell>category</Table.HeadCell>
          <Table.HeadCell>customNote</Table.HeadCell>
          <Table.HeadCell>message</Table.HeadCell>
          <Table.HeadCell>amount</Table.HeadCell>
          <Table.HeadCell>currency</Table.HeadCell>
        </Table.Head>
        <Table.Body>
          {transactions.map((tx) => (
            <Table.Row key={tx.importTxId}>
              <Table.Cell>{tx.offsetAccount}</Table.Cell>
              <Table.Cell>{tx.dateCreated}</Table.Cell>
              <Table.Cell>{tx.dateCharged}</Table.Cell>
              <Table.Cell>{tx.category}</Table.Cell>
              <Table.Cell>{tx.customNote}</Table.Cell>
              <Table.Cell>{tx.message}</Table.Cell>
              <Table.Cell>{tx.amount}</Table.Cell>
              <Table.Cell>{tx.currency}</Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </Layout>
  );
}
