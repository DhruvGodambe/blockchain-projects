const {
    attestFromSolana,
    attestFromEth,
    createWra,
    createWrappedOnEth,
    parseSequenceFromLogSolana,
    getSignedVAA,
    getEmitterAddressSolana,
    transferFromSolana,
    redeemOnEth
} = require("@certusone/wormhole-sdk");

const { Connection } = require("@solana/web3.js")

const SOLANA_HOST = "https://green-burned-diagram.solana-devnet.discover.quiknode.pro/16485d2eb6c50808171474e2bd1941559f8a738f/";
const SOL_BRIDGE_ADDRESS = "3u8hJUVTA4jH1wYAyUur7FFZVQ8H635K3tSHHF4ssjQ5";
const SOL_TOKEN_BRIDGE_ADDRESS = "DZnkkTmCiFWfYTfT41X3Rd1kDgozqzxWaHqsw6W4x2oe";
const connection = new Connection(SOLANA_HOST, "confirmed");
const payerAddress = "BDUeqeWkJGcb58LpRfv9Ump3PHTKQRzmJjfjVUaWaQc8";
const mintAddress = "BDUeqeWkJGcb58LpRfv9Ump3PHTKQRzmJjfjVUaWaQc8";
const WORMHOLE_RPC_HOST = "https://wormhole-v2-testnet-api.certus.one";
const CHAIN_ID_SOLANA = 1;
const ETH_TOKEN_BRIDGE_ADDRESS = "0xF890982f9310df57d00f659cf4fd87e65adEd8d7";

const fromAddress = "BDUeqeWkJGcb58LpRfv9Ump3PHTKQRzmJjfjVUaWaQc8";
const amount = 100;
const targetAddress = "BDUeqeWkJGcb58LpRfv9Ump3PHTKQRzmJjfjVUaWaQc8";
const CHAIN_ID_ETH = 2;
const originAddress = "";
const originChain = "ETH";


const solanaToETH = async () => {
    console.log(connection);
    const transaction = await attestFromSolana(
        connection,
        SOL_BRIDGE_ADDRESS,
        SOL_TOKEN_BRIDGE_ADDRESS,
        payerAddress,
        mintAddress
    );
    console.log("hi");
    
    const signed = await wallet.signTransaction(transaction);
    const txid = await connection.sendRawTransaction(signed.serialize());
    await connection.confirmTransaction(txid);

    const info = await connection.getTransaction(txid);
    const sequence = parseSequenceFromLogSolana(info);
    const emitterAddress = await getEmitterAddressSolana(SOL_TOKEN_BRIDGE_ADDRESS);

    const { signedVAA } = await getSignedVAA(
        WORMHOLE_RPC_HOST,
        CHAIN_ID_SOLANA,
        emitterAddress,
        sequence
    );
    // Create the wrapped token on Ethereum
    await createWrappedOnEth(ETH_TOKEN_BRIDGE_ADDRESS, signer, signedVAA);

}

const transferSolanaToETH = async () => {
    const transaction = await transferFromSolana(
        connection,
        SOL_BRIDGE_ADDRESS,
        SOL_TOKEN_BRIDGE_ADDRESS,
        payerAddress,
        fromAddress,
        mintAddress,
        amount,
        targetAddress,
        CHAIN_ID_ETH,
        originAddress,
        originChain
    );
    const signed = await wallet.signTransaction(transaction);
    const txid = await connection.sendRawTransaction(signed.serialize());
    await connection.confirmTransaction(txid);
    // Get the sequence number and emitter address required to fetch the signedVAA of our message
    const info = await connection.getTransaction(txid);
    const sequence = parseSequenceFromLogSolana(info);
    const emitterAddress = await getEmitterAddressSolana(SOL_TOKEN_BRIDGE_ADDRESS);
    // Fetch the signedVAA from the Wormhole Network (this may require retries while you wait for confirmation)
    const { signedVAA } = await getSignedVAA(
        WORMHOLE_RPC_HOST,
        CHAIN_ID_SOLANA,
        emitterAddress,
        sequence
    );
    // Redeem on Ethereum
    await redeemOnEth(ETH_TOKEN_BRIDGE_ADDRESS, signer, signedVAA);
}

solanaToETH();