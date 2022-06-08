import { ImageCacheResponse, OpenAIResultChoice } from './../../types'
import SpellRunner from '../../src/spellManager/SpellRunner'
import imageGeneratorSpell from '../../data/imageGeneratorSpell'
import thothInterfaceStub from '../../data/thothInterfaceStub'
import generatorSpell from '../../data/generatorSpell'
import codeSpell from '../../data/codeSpell'
import generatorSwitchSpell from '../../data/generatorSwitchSpell'
import readWriteStateSpell from '../../data/readWriteStateSpell'
import parentSpell from '../../data/parentSpell'
import subSpell from '../../data/subSpell'

require('regenerator-runtime/runtime')

describe('SpellRunner', () => {
  it('Returns an Image Cache Response from an Image Generator Component Spell', async () => {
    const imageCacheMock = jest
      .fn()
      .mockImplementation((caption: string): Promise<ImageCacheResponse> => {
        return new Promise(resolve =>
          resolve({
            images: [
              {
                imageUrl:
                  'https://aidungeon-images.s3.us-east-2.amazonaws.com/generated_images/48b384e5-823b-44de-a77a-5aad3ee03908.png',
              },
            ],
          } as ImageCacheResponse)
        )
      })
    const runnerInstance = new SpellRunner({
      thothInterface: {
        ...thothInterfaceStub,
        readFromImageCache: imageCacheMock,
      },
    })
    await runnerInstance.loadSpell(imageGeneratorSpell)
    const imageSpellResult = await runnerInstance.defaultRun({
      input: 'imageprompt',
    })
    expect(imageCacheMock).toBeCalledWith('imageprompt', undefined, undefined)
    expect(imageSpellResult).toEqual({
      output:
        'https://aidungeon-images.s3.us-east-2.amazonaws.com/generated_images/48b384e5-823b-44de-a77a-5aad3ee03908.png',
    })
  })
  it('Returns a Text Completion from an Generator Component Spell', async () => {
    const completionMock = jest.fn().mockImplementation(() => {
      return new Promise(resolve => resolve('completionresult')) as Promise<
        string | OpenAIResultChoice
      >
    })
    const runnerInstance = new SpellRunner({
      thothInterface: {
        ...thothInterfaceStub,
        completion: completionMock,
      },
    })
    await runnerInstance.loadSpell(generatorSpell)
    const generatorSpellResult = await runnerInstance.defaultRun({
      input: 'textprompt',
    })
    expect(completionMock).toBeCalledWith({
      frequencyPenalty: 0,
      maxTokens: 50,
      model: 'vanilla-jumbo',
      prompt: 'textprompt',
      stop: ['\n'],
      temperature: 0.8,
    })
    expect(generatorSpellResult).toEqual({
      output: 'textpromptcompletionresult',
    })
  })
  it('Returns a Text Completion from an Generator Spell that uses a Switch Component', async () => {
    const completionMock = jest.fn().mockImplementation(() => {
      return new Promise(resolve => resolve('completionresult')) as Promise<
        string | OpenAIResultChoice
      >
    })
    const runnerInstance = new SpellRunner({
      thothInterface: {
        ...thothInterfaceStub,
        completion: completionMock,
      },
    })
    await runnerInstance.loadSpell(generatorSwitchSpell)
    const generatorSpellResult = await runnerInstance.defaultRun({
      input: 'yes',
    })
    expect(completionMock).toBeCalledWith({
      frequencyPenalty: 0,
      maxTokens: 50,
      model: 'vanilla-jumbo',
      prompt: 'Generate',
      stop: ['\n'],
      temperature: 0.7,
    })
    expect(generatorSpellResult).toEqual({
      output: 'completionresult',
    })
  })
  it('Returns a Code component result from an Generator Spell that uses a Switch Component', async () => {
    const completionMock = jest.fn().mockImplementation(() => {
      return new Promise(resolve => resolve('completionresult')) as Promise<
        string | OpenAIResultChoice
      >
    })
    const runnerInstance = new SpellRunner({
      thothInterface: {
        ...thothInterfaceStub,
        completion: completionMock,
      },
    })
    await runnerInstance.loadSpell(generatorSwitchSpell)
    const generatorSpellResult = await runnerInstance.defaultRun({
      input: 'no',
    })
    expect(generatorSpellResult).toEqual({
      output: 'nope',
    })
  })
  it('Returns result from an Code Component Spell', async () => {
    const codeMock = jest
      .fn()
      .mockImplementation(thothInterfaceStub.processCode)
    const runnerInstance = new SpellRunner({
      thothInterface: { ...thothInterfaceStub, processCode: codeMock },
    })
    await runnerInstance.loadSpell(codeSpell)
    const codeSpellResult = await runnerInstance.defaultRun({
      input: 'textprompt',
    })
    expect(codeMock).toBeCalledWith(
      "\n// inputs: dictionary of inputs based on socket names\n// data: internal data of the node to read or write to nodes data state\n// state: access to the current game state in the state manager window. Return state to update the state.\nfunction worker(inputs, data, state) {\n\n  // Keys of the object returned must match the names \n  // of your outputs you defined.\n  // To update the state, you must return the modified state.\n  return {modifiedInput: inputs.input + ' modified'}\n}\n",
      { input: ['textprompt'] },
      {},
      {}
    )
    expect(codeSpellResult).toEqual({
      output: 'textprompt modified',
    })
  })

  it('Returns result from an Read/Write State Component Spell', async () => {
    let spellState = {}
    const codeMock = jest
      .fn()
      .mockImplementation(thothInterfaceStub.processCode)
    const runnerInstance = new SpellRunner({
      thothInterface: {
        ...thothInterfaceStub,
        processCode: codeMock,
        getCurrentGameState: () => spellState,
        setCurrentGameState: (state: Record<string, unknown>) => {
          spellState = state
        },
        updateCurrentGameState: (state: Record<string, unknown>) => {
          spellState = { ...spellState, ...state }
        },
      },
    })

    await runnerInstance.loadSpell(readWriteStateSpell)
    const readWriteStateSpellResult = await runnerInstance.defaultRun({
      input: 'textprompt',
    })
    expect(codeMock).toBeCalledWith(
      '\n// inputs: dictionary of inputs based on socket names\n// data: internal data of the node to read or write to nodes data state\n// state: access to the current game state in the state manager window. Return state to update the state.\nfunction worker(inputs, data, state) {\n\n  // Keys of the object returned must match the names \n  // of your outputs you defined.\n  // To update the state, you must return the modified state.\n  return inputs\n}\n',
      { input: ['textprompt'] },
      {},
      {
        input: 'textprompt',
      }
    )
    expect(readWriteStateSpellResult).toEqual({
      output: 'textprompt',
    })
  })
  it('Returns an Echo component result from a SubSpell one layer down', async () => {
    const nestedRunnerInstance = new SpellRunner({
      thothInterface: {
        ...thothInterfaceStub,
      },
    })

    const runnerInstance = new SpellRunner({
      thothInterface: {
        ...thothInterfaceStub,
        runSpell: async (
          flattenedInputs: Record<string, any>,
          spellId: string,
          state: Record<string, any>
        ) => {
          await nestedRunnerInstance.loadSpell(subSpell)
          const nestedSpellResult = await nestedRunnerInstance.defaultRun(
            flattenedInputs
          )
          console.log({ flattenedInputs, nestedSpellResult })
          return nestedSpellResult
        },
      },
    })
    await runnerInstance.loadSpell(parentSpell)
    const generatorSpellResult = await runnerInstance.defaultRun({
      Input: 'echoThisInput',
    })
    expect(generatorSpellResult).toEqual({
      'output-233': 'echoThisInput',
    })
  })
})
