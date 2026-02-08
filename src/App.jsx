import { useState } from 'react'
import { useData } from './context/DataContext.jsx'
import Header from './components/Header.jsx'
import TabBar from './components/TabBar.jsx'
import FAB from './components/FAB.jsx'
import DayView from './views/DayView.jsx'
import WeekView from './views/WeekView.jsx'
import ExportView from './views/ExportView.jsx'
import MealForm from './forms/MealForm.jsx'
import PainForm from './forms/PainForm.jsx'
import BowelForm from './forms/BowelForm.jsx'
import SummaryForm from './forms/SummaryForm.jsx'

export default function App() {
  const { state } = useData()
  const [modal, setModal] = useState(null) // { type: 'meal'|'pain'|'bowel'|'summary', entry?: object }

  function openForm(type, entry = null) {
    setModal({ type, entry })
  }

  function closeForm() {
    setModal(null)
  }

  function renderTab() {
    switch (state.activeTab) {
      case 'day':
        return <DayView onEditEntry={openForm} />
      case 'week':
        return <WeekView />
      case 'export':
        return <ExportView />
      default:
        return <DayView onEditEntry={openForm} />
    }
  }

  function renderModal() {
    if (!modal) return null

    const props = {
      date: state.selectedDate,
      entry: modal.entry,
      onClose: closeForm,
    }

    switch (modal.type) {
      case 'meal':
        return <MealForm {...props} />
      case 'pain':
        return <PainForm {...props} />
      case 'bowel':
        return <BowelForm {...props} />
      case 'summary':
        return <SummaryForm {...props} />
      default:
        return null
    }
  }

  return (
    <div className="app">
      <Header />
      <main className="app-content">{renderTab()}</main>
      {state.activeTab === 'day' && <FAB onSelect={openForm} />}
      <TabBar />
      {renderModal()}
    </div>
  )
}
