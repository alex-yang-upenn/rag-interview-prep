import Image from "next/image";
import dynamic from 'next/dynamic';
import QuestionList from "@/components/question-list";



export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-tl from-red-600 to-yellow-400 flex flex-col">
      {/* Title Section */}
      <div className="text-white text-6xl font-bold font-['Inter'] text-center py-8">
        Agent Interview
      </div>
      
      {/* Three-column Layout */}
      <div className="flex-grow flex flex-col md:flex-row">
        {/* User Data Column */}
        <div className="w-full md:w-1/3 border-b md:border-b-0 md:border-r border-white p-4">
          <h2 className="text-white text-3xl font-bold mb-4">User Data</h2>
          {/* Add user data content here */}
        </div>
        
        {/* Interview Column */}
        <div className="w-full md:w-1/3 border-b md:border-b-0 md:border-r border-white p-4">
          <h2 className="text-white text-3xl font-bold mb-4">Interview</h2>
          <QuestionList />
        </div>
        
        {/* Advice Column */}
        <div className="w-full md:w-1/3 p-4">
          <h2 className="text-white text-3xl font-bold mb-4">Advice</h2>
          {/* Add advice content here */}
        </div>
      </div>
    </main>
  )
}