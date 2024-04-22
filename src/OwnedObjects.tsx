import {
  useCurrentAccount,
  useSignAndExecuteTransactionBlock,
  useSuiClientInfiniteQuery,
} from "@mysten/dapp-kit";
import { TransactionBlock } from "@mysten/sui.js/transactions";
import { SUI_TYPE_ARG } from "@mysten/sui.js/utils";
import { Button, Callout, Flex, Text } from "@radix-ui/themes";
import { useLayoutEffect } from "react";

const MAX_GAS_OBJECTS = 256;

export function OwnedObjects() {
  const account = useCurrentAccount();
  const {
    data,
    isPending,
    isRefetching,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    error,
    refetch,
  } = useSuiClientInfiniteQuery(
    "getCoins",
    {
      owner: account!.address,
      coinType: SUI_TYPE_ARG,
      limit: 50,
    },
    {
      enabled: !!account,
    },
  );

  useLayoutEffect(() => {
    if (!isFetchingNextPage && hasNextPage) {
      fetchNextPage();
    }
  }, [isFetchingNextPage, hasNextPage]);

  const signAndExecuteTransactionBlock = useSignAndExecuteTransactionBlock({
    async onSuccess() {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await refetch();
    },
  });

  if (!account) {
    return;
  }

  if (error) {
    return <Flex>Error: {error.message}</Flex>;
  }

  if (isPending || isFetchingNextPage || !data) {
    return <Flex>Loading...</Flex>;
  }

  const coins = data.pages
    .flatMap((page) => page.data)
    .sort((a, b) => {
      return Number(b.balance) - Number(a.balance);
    });

  const merge = () => {
    const txb = new TransactionBlock();
    txb.setSender(account!.address);
    txb.setGasPayment(
      coins.slice(0, MAX_GAS_OBJECTS - 1).map((coin) => ({
        objectId: coin.coinObjectId,
        version: coin.version,
        digest: coin.digest,
      })),
    );
    signAndExecuteTransactionBlock.mutateAsync({ transactionBlock: txb });
  };

  return (
    <Flex direction="column" my="2">
      <Text>
        <strong>Address:</strong> {account.address}
      </Text>

      {signAndExecuteTransactionBlock.error && (
        <Callout.Root color="red" size="1">
          <Callout.Text>
            Error: {String(signAndExecuteTransactionBlock.error.message)}
          </Callout.Text>
        </Callout.Root>
      )}

      {coins.length === 0 ? (
        <Text>Wallet does not hold any SUI.</Text>
      ) : (
        <>
          <Text>Wallet holds {coins.length} SUI Objects</Text>
          {coins.length > 1 && (
            <Button
              disabled={
                signAndExecuteTransactionBlock.isPending || isRefetching
              }
              onClick={() => merge()}
            >
              {signAndExecuteTransactionBlock.isPending
                ? "Waiting for tra>nsaction..."
                : isRefetching
                  ? "Refetching data..."
                  : "Merge"}
            </Button>
          )}
        </>
      )}
    </Flex>
  );
}
