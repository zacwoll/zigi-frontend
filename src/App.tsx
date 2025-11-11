import './App.css'
import { TaskBoard } from "./components/TaskBoard";

function App() {
  return (
    <>
      <div className="min-h-screen flex flex-col bg-linear-to-br from-slate-100 to-slate-200 text-gray-800">
        {/* Header */}
        <header className="app-header">
          <h1 className="text-4xl md:text-5xl font-extrabold text-center text-slate-800 tracking-tight drop-shadow-sm">
            Tasks for Zigi
          </h1>
        </header>

        {/* Main Board */}
        <main className="task-board grow flex items-center justify-center px-4 py-8">
          <TaskBoard />
        </main>

        {/* Footer */}
        <footer className="app-footer text-center text-slate-500 mt-2 text-lg md:text-xl">
          <p>Tasks are shown for 24 hours after completion or failure.</p>
        </footer>
      </div>
    </>
  );
}

export default App
