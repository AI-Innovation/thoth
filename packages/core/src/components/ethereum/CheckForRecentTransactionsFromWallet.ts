/* eslint-disable @typescript-eslint/no-inferrable-types */
/* eslint-disable no-console */
/* eslint-disable require-await */
/* eslint-disable @typescript-eslint/no-unused-vars */
import * as ethers from 'ethers'
import Rete from 'rete'

const etherscanProvider = new ethers.providers.EtherscanProvider()

import {
  EngineContext,
  NodeData,
  ThothNode,
  ThothWorkerInputs,
  ThothWorkerOutputs,
} from '../../../types'
import { triggerSocket, numSocket, stringSocket } from '../../sockets'
import { ThothComponent } from '../../thoth-component'

const info = 'Check the recent transactions from another wallet'

export class CheckForRecentTransactionsFromWallet extends ThothComponent<void> {
  constructor() {
    super('Check For Recent Transaction From Wallet')

    this.task = {
      outputs: {
        output: 'output',
        trigger: 'option',
      },
    }

    this.category = 'Ethereum'
    this.display = true
    this.info = info
  }

  builder(node: ThothNode) {
    const addressInput = new Rete.Input('address', 'Wallet Address', numSocket)
    const senderInput = new Rete.Input('sender', 'Sender Address', numSocket)
    const dataInput = new Rete.Input('trigger', 'Trigger', triggerSocket, true)
    const dataOutput = new Rete.Output('trigger', 'Trigger', triggerSocket)
    const balanceOutput = new Rete.Output('output', 'Output', stringSocket)

    return node
      .addInput(addressInput)
      .addInput(senderInput)
      .addInput(dataInput)
      .addOutput(dataOutput)
      .addOutput(balanceOutput)
  }

  async worker(
    node: NodeData,
    inputs: ThothWorkerInputs,
    outputs: ThothWorkerOutputs,
    { silent, thoth }: { silent: boolean; thoth: EngineContext }
  ) {
    const address = inputs['address'][0] as unknown as string
    const sender = inputs['sender'][0] as unknown as string
    node.display(address)

    const checkForRecentTransactionFromWalletToWallet = async (
      walletAddress,
      walletAddress2
    ) => {
      // check if there is a recent transaction from walletAddress to walletAddress2
      // if there is, return the transaction
      // if there is not, return null
      const transactions = await etherscanProvider.getHistory(walletAddress)
      for (let i = 0; i < transactions.length; i++) {
        if (transactions[i].to === walletAddress2) {
          return transactions[i]
        }
      }
      return null
    }

    const output = await checkForRecentTransactionFromWalletToWallet(
      address,
      sender
    )

    return {
      output,
    }
  }
}
