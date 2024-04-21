import { ConnectButton, useSuiClientContext } from "@mysten/dapp-kit";
import { Box, Container, Flex, Heading, Select } from "@radix-ui/themes";
import { WalletStatus } from "./WalletStatus";

function App() {
  const { network, networks, selectNetwork } = useSuiClientContext();

  return (
    <>
      <Flex
        position="sticky"
        px="4"
        py="2"
        justify="between"
        style={{
          borderBottom: "1px solid var(--gray-a2)",
        }}
      >
        <Box>
          <Heading>Sui Merger</Heading>
        </Box>

        <Flex align="center" gap="4">
          <Select.Root
            value={network}
            onValueChange={(nextNetwork) => selectNetwork(nextNetwork)}
          >
            <Select.Trigger />
            <Select.Content>
              <Select.Group>
                <Select.Label>Sui Network</Select.Label>
                {Object.keys(networks).map((key) => (
                  <Select.Item value={key}>{key}</Select.Item>
                ))}
              </Select.Group>
            </Select.Content>
          </Select.Root>

          <ConnectButton />
        </Flex>
      </Flex>

      <Container>
        <Container
          mt="5"
          pt="2"
          px="4"
          style={{ background: "var(--gray-a2)", minHeight: 500 }}
        >
          <WalletStatus />
        </Container>
      </Container>
    </>
  );
}

export default App;
