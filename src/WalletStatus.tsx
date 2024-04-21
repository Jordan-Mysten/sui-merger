import { useCurrentAccount } from "@mysten/dapp-kit";
import { Container, Heading } from "@radix-ui/themes";
import { OwnedObjects } from "./OwnedObjects";

export function WalletStatus() {
  const account = useCurrentAccount();

  if (!account) {
    return (
      <Container my="2">
        <Heading mb="2" align="center">
          Connect wallet to get started
        </Heading>
      </Container>
    );
  }

  return (
    <Container my="2">
      <OwnedObjects />
    </Container>
  );
}
