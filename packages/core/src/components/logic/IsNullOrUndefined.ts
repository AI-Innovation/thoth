/* eslint-disable no-console */
/* eslint-disable require-await */
/* eslint-disable @typescript-eslint/no-unused-vars */
import Rete from 'rete'

import {
  EngineContext,
  NodeData,
  ThothNode,
  ThothWorkerInputs,
  ThothWorkerOutputs,
} from '../../../types'
import { triggerSocket, stringSocket } from '../../sockets'
import { ThothComponent } from '../../thoth-component'

const info = 'Is Null Or Undefined checks if the input is null or undefined'

export class IsNullOrUndefined extends ThothComponent<Promise<void>> {
  constructor() {
    super('Is Null Or Undefined')

    this.task = {
      outputs: { isTrue: 'option', isFalse: 'option' },
    }

    this.category = 'Logic'
    this.display = true
    this.info = info
  }

  builder(node: ThothNode) {
    const inp = new Rete.Input('string', 'String', stringSocket)
    const dataInput = new Rete.Input('trigger', 'Trigger', triggerSocket, true)
    const isTrue = new Rete.Output('isTrue', 'True', triggerSocket)
    const isFalse = new Rete.Output('isFalse', 'False', triggerSocket)

    return node
      .addInput(inp)
      .addInput(dataInput)
      .addOutput(isTrue)
      .addOutput(isFalse)
  }

  async worker(
    node: NodeData,
    inputs: ThothWorkerInputs,
    outputs: ThothWorkerOutputs,
    { silent, thoth }: { silent: boolean; thoth: EngineContext }
  ) {
    const action = inputs['string'][0] ?? inputs['string']
    const is =
      action === null || action === undefined || (action as string).length <= 0
    console.log('found null or empty input:', is)

    this._task.closed = is ? ['isFalse'] : ['isTrue']
  }
}
