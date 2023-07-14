import { executeTransaction } from "@cardinal/common"
import type { Wallet } from "@coral-xyz/anchor"
import { BN } from "@coral-xyz/anchor"
import type { Connection } from "@solana/web3.js"
import { PublicKey, Transaction } from "@solana/web3.js"

import { findPaymentInfoId, rewardsCenterProgram } from "../../sdk"

export const commandName = "updatePaymentInfo"
export const description = "Update a payment info object"

export type Args = {
  identifier: string
  ix: UpdatePaymentInfoIx
}

export type UpdatePaymentInfoIx = {
  authority: PublicKey
  paymentAmount: number
  paymentMint: PublicKey
  paymentShares: { address: PublicKey; basisPoints: number }[]
}

export const getArgs = (_connection: Connection, wallet: Wallet) => ({
  identifier: "cardinal-default",
  ix: {
    authority: wallet.publicKey,
    paymentAmount: 2 * 10 ** 6,
    paymentMint: PublicKey.default,
    paymentShares: [
      {
        address: new PublicKey("4dNCRewnFfS89p7BAV3rnJu6NKnDoKxzsY1pAX7Ga5JT"),
        basisPoints: 10000,
      },
    ],
  },
})

export const handler = async (
  connection: Connection,
  wallet: Wallet,
  args: Args
) => {
  const transaction = new Transaction()
  const paymentInfoId = findPaymentInfoId(args.identifier)
  const program = rewardsCenterProgram(connection, wallet)

  transaction.add(
    await program.methods
      .updatePaymentInfo({
        authority: args.ix.authority,
        paymentAmount: new BN(args.ix.paymentAmount),
        paymentMint: args.ix.paymentMint,
        paymentShares: args.ix.paymentShares,
      })
      .accounts({
        paymentInfo: paymentInfoId,
        authority: wallet.publicKey,
        payer: wallet.publicKey,
      })
      .instruction()
  )
  await executeTransaction(connection, transaction, wallet)
  console.log(
    `Updated payment manager ${args.identifier} [${paymentInfoId.toString()}]`,
    JSON.stringify(args.ix, null, 2)
  )
}
