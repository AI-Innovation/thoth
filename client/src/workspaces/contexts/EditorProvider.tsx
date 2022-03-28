import { initEditor } from '@latitudegames/thoth-core'
import {
  ChainData,
  IRunContextEditor,
} from '@latitudegames/thoth-core/dist/types'
import React, {
  useRef,
  useContext,
  createContext,
  useState,
  useEffect,
} from 'react'

import { useLazyGetSpellQuery, Spell } from '../../state/api/spells'

import LoadingScreen from '../../components/LoadingScreen/LoadingScreen'
import { MyNode } from '../../components/Node/Node'
import gridimg from '@/grid.png'
import { usePubSub } from '../../contexts/PubSubProvider'
import {
  useThothInterface,
  ThothInterfaceContext,
} from './ThothInterfaceProvider'

export type ThothTab = {
  layoutJson: string
  name: string
  id: string
  spell: string
  module: string
  type: string
  active: boolean
}

// TODO give better typing to the editor
const Context = createContext({
  run: () => {},
  getEditor: (): IRunContextEditor | null => null,
  editor: {} as Record<string, any>,
  serialize: (): ChainData | undefined => undefined,
  buildEditor: (
    el: HTMLDivElement,
    // todo update this to use proper spell type
    spell: Spell | undefined,
    tab: ThothTab,
    reteInterface: ThothInterfaceContext
  ) => {},
  setEditor: (editor: any) => {},
  getNodeMap: () => {},
  getNodes: () => {},
  loadChain: (chain: any) => {},
  setContainer: () => {},
  undo: () => {},
  redo: () => {},
  del: () => {},
})

export const useEditor = () => useContext(Context)

const EditorProvider = ({ children }) => {
  const [editor, setEditorState] = useState({
    components: [],
    loadGraph: (chain: any) => {},
  })
  const editorRef = useRef<IRunContextEditor | null>(null)
  const pubSub = usePubSub()

  const setEditor = editor => {
    editorRef.current = editor
    setEditorState(editor)
  }

  const getEditor = () => {
    if (!editorRef.current) return null
    return editorRef.current
  }

  const buildEditor = async (container, _spell, tab, thoth) => {
    // eslint-disable-next-line no-console
    const newEditor = await initEditor({
      container,
      pubSub,
      // calling thoth during migration of screens
      thoth,
      tab,
      // MyNode is a custom default style for nodes
      node: MyNode,
    })

    // set editor to the map
    setEditor(newEditor)

    if (tab.type === 'spell') {
      // copy spell in case it is read onl
      const spell = JSON.parse(JSON.stringify(_spell))
      newEditor.loadGraph(spell.chain)
    }

    if (tab.type === 'module') {
      const moduleDoc = await thoth.getModule(tab.module)
      newEditor.loadGraph(moduleDoc.toJSON().data)
    }
  }

  const run = () => {
    // console.log('RUN')
  }

  const undo = () => {
    if (!editorRef.current) return
    editorRef.current.trigger('undo')
  }

  const redo = () => {
    if (!editorRef.current) return
    editorRef.current.trigger('redo')
  }

  const del = () => {
    if (!editorRef.current) return
    editorRef.current.trigger('delete')
  }

  const serialize = () => {
    if (!editorRef.current) return
    return editorRef.current.toJSON()
  }

  const getNodeMap = () => {
    return editor && editor.components
  }

  const getNodes = () => {
    return editor && Object.fromEntries(editor.components)
  }

  const loadChain = graph => {
    editor.loadGraph(graph)
  }

  const setContainer = () => {
    // console.log('set container')
  }

  const publicInterface = {
    run,
    serialize,
    editor,
    editorRef,
    buildEditor,
    getNodeMap,
    getNodes,
    loadChain,
    setEditor,
    getEditor,
    undo,
    redo,
    del,
    setContainer,
  }

  return <Context.Provider value={publicInterface}>{children}</Context.Provider>
}

const RawEditor = ({ tab, children }) => {
  const [getSpell, { data: spell, isLoading }] = useLazyGetSpellQuery()
  const [loaded, setLoaded] = useState(false)
  const { buildEditor } = useEditor()
  // This will be the main interface between thoth and rete
  const reteInterface = useThothInterface()

  useEffect(() => {
    if (!tab) return

    if (tab?.spellId) getSpell(tab.spellId)
  }, [tab])

  if (!tab || (tab.type === 'spell' && (isLoading || !spell)))
    return <LoadingScreen />

  return (
    <>
      <div
        style={{
          textAlign: 'left',
          width: '100vw',
          height: '100vh',
          position: 'absolute',
          backgroundColor: '#191919',
          backgroundImage: `url('${gridimg}')`,
        }}
        onDragOver={e => {
          e.preventDefault()
        }}
        onDrop={e => {}}
      >
        <div
          ref={el => {
            if (el && !loaded) {
              buildEditor(el, spell, tab, reteInterface)
              setLoaded(true)
            }
          }}
        />
      </div>
      {children}
    </>
  )
}

export const Editor = React.memo(RawEditor)

Editor.whyDidYouRender = false

export default EditorProvider
