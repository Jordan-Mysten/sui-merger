import {
  useCurrentAccount,
  useSignAndExecuteTransactionBlock,
  useSuiClientQuery,
} from "@mysten/dapp-kit";
import { TransactionBlock } from "@mysten/sui.js/transactions";
import { SUI_TYPE_ARG } from "@mysten/sui.js/utils";
import { Button, Flex, Text } from "@radix-ui/themes";

const MAX_GAS_OBJECTS = 256;

export function OwnedObjects() {
  const account = useCurrentAccount();
  const { data, isPending, isRefetching, error, refetch } = useSuiClientQuery(
    "getCoins",
    {
      owner: account!.address,
      coinType: SUI_TYPE_ARG,
    },
    {
      enabled: !!account,
    },
  );

  const signAndExecuteTransactionBlock = useSignAndExecuteTransactionBlock({
    async onSuccess() {
      console.log("done");
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

  if (isPending || !data) {
    return <Flex>Loading...</Flex>;
  }

  const merge = () => {
    const txb = new TransactionBlock();
    txb.setSender(account!.address);
    txb.setGasPayment(
      data.data.slice(0, MAX_GAS_OBJECTS - 1).map((coin) => ({
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

      {data.data.length === 0 ? (
        <Text>Wallet does not hold any SUI.</Text>
      ) : (
        <>
          <Text>Wallet holds {data.data.length} SUI Objects</Text>
          {data.data.length > 1 && (
            <Button
              disabled={
                signAndExecuteTransactionBlock.isPending || isRefetching
              }
              onClick={() => merge()}
            >
              {signAndExecuteTransactionBlock.isPending
                ? "Waiting for transaction..."
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
