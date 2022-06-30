import {
    Keypair,
    Connection,
    PublicKey,
    LAMPORTS_PER_SOL, 
    Transaction,
    TransactionInstruction,
    sendAndConfirmTransaction,
} from '@solana/web3.js';
import fs from 'mz/fs';
import path from 'path';

const PROGRAM_KEYPAIR_PATH = path.join(__dirname, '../../dest/program/solana_001_hello_word-keypair.json');
console.log(PROGRAM_KEYPAIR_PATH)
async function main() {
    console.log("Starting client...");
    /* Connection to Solana Network */
    let connection = new Connection('https://api.devnet.solana.com', 'confirmed')
 
    /**
     * Pull the program's public key
     */
    const secretKeyString = await fs.readFile(PROGRAM_KEYPAIR_PATH, 'utf8');
    const secretKey = Uint8Array.from(JSON.parse(secretKeyString));
    const programKeypair = Keypair.fromSecretKey(secretKey);
    // Get the program ID from the program keypair
    let programId: PublicKey = programKeypair.publicKey;

    /**
     * Create an account to use program and ask for some lamports to be deposited
     */
    const triggerKeypair = Keypair.generate();
    const airdropReq = await connection.requestAirdrop(triggerKeypair.publicKey, LAMPORTS_PER_SOL);
    await connection.confirmTransaction(airdropReq);

    /**
     * Interact with the program
    */
    console.log('Interact with program ..', programId.toBase58());
    var inputData:number[] = [1, 2, 3, 4, 5];
    const instruction = new TransactionInstruction({
        keys: [{pubkey : triggerKeypair.publicKey, isSigner: true, isWritable: true}], 
        programId, 
        data: Buffer.from(inputData),
    });
    await sendAndConfirmTransaction(
        connection,
        new Transaction().add(instruction),
        [triggerKeypair],
    )

}

main().then(
  () => process.exit(),
  err => {
    console.error(err);
    process.exit(-1);
  },
);