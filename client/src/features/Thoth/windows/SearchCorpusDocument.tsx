import { useState } from 'react'
import { useModal } from '@/contexts/ModalProvider';
import { VscWand, VscTrash, VscSave } from 'react-icons/vsc'
import axios from 'axios'

const SearchCorpusDocument = ({ document, getDoc }) => {
  const [isInclude, setIsInclude] = useState(document.is_included)
  const { openModal } = useModal()

  const openAddModal = () => {
    // openModal({
    //   modal: 'documentAddModal'
    // })
  }

  const openEditModal = (field: string) => {
    openModal({
      modal: 'documentEditModal',
      field,
      document,
      getDocuments: getDoc
    })
  }
  
  const openDeleteModal = () => {
    openModal({
      modal: 'documentDeleteModal',
      documentId: document.id,
      getDocuments: getDoc
    })
  }

  const saveDocument = async () => {
    const body = {
      ...document,
      documentId: document.id,
      storeId: document.store_id,
      is_included: isInclude
    }
    console.log('body ::: ', body);
    await axios.post(
      `${process.env.REACT_APP_SEARCH_SERVER_URL}/update_document`,
      body
    )
    await getDoc()
  }

  return (
    <div className="search-corpus-document">
      <div className="d-flex align-items-center justify-content-between">
        <div className="form-item">
          <input 
            type="checkbox" 
            name="include" 
            className="custom-checkbox" 
            checked={isInclude} 
            onChange={() => setIsInclude(!isInclude)} 
          />
          <span className="form-item-label" style={{ marginBottom: 'unset' }}>Include</span>
        </div>
        <div className="form-item">
          <VscSave size={20} color='#A0A0A0' onClick={saveDocument} style={{ margin: '0 0.5rem'}}/>
          <VscTrash size={20} color='#A0A0A0' onClick={openDeleteModal}/>
        </div>
      </div>
      <div className="form-item">
        <span className="form-item-label">Keywords</span>
        <div className='d-flex justify-content-between align-items-center'>
          <input
            type="text"
            className="form-text-area"
            style={{ width: '96%' }}
            value={document.keywords}
            readOnly
          ></input>
          <VscWand size={20} color='#A0A0A0' onClick={() => openEditModal('keywords')}/>
        </div>
      </div>
      <div className="form-item">
        <span className="form-item-label">Description</span>
        <div className="d-flex justify-content-between align-items-center">
          <input
            type="text"
            className="form-text-area"
            style={{ width: '96%' }}
            value={document.description}
            readOnly
          ></input>
          <VscWand size={20} color='#A0A0A0' onClick={() => openEditModal('description')}/>  
        </div>
      </div>
      <div className="form-item search-corpus">
        <span className="form-item-label">Type</span>
        <select
          name="documents"
          id="documents"
        >
          <option value="document">Document</option>
        </select>
      </div>

      <div className="form-item">
        <span className="form-item-label">Content</span>
        <div className="d-flex ">
          <button
            className="button search-corpus-btn"
            type="button"
            onClick={async e => {
              e.preventDefault()
            }}
          >
            Click to edit
          </button>
          <button
            className="button search-corpus-btn"
            type="button"
            onClick={async e => {
              e.preventDefault()
              openAddModal()
            }}
          >
            Click to add
          </button>
        </div>
      </div>
    </div>
  );
}

export default SearchCorpusDocument;