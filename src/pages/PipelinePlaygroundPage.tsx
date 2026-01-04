import { useState } from 'react';
import PipelineEditor from '../components/pipeline/PipelineEditor';
import { PipelineConfig } from '../types';

const MOCK_CONFIG: PipelineConfig = {
    type: 'simple_rag',
    steps: [
        {
            name: 'Query Rewrite',
            type: 'transform',
            config: { method: 'llm', prompt: 'Rewrite this query...' }
        },
        {
            name: 'Document Retrieval',
            type: 'retrieve',
            config: { top_k: 5, method: 'hybrid' }
        },
        {
            name: 'Re-ranking',
            type: 'filter',
            config: { model: 'bge-reranker-large' }
        },
        {
            name: 'Generate Answer',
            type: 'generate',
            config: { temperature: 0.7 }
        }
    ],
    chat_history_config: { include_history: true, max_history_turns: 3 }
};

export default function PipelinePlaygroundPage() {
    const [config, setConfig] = useState<PipelineConfig>(MOCK_CONFIG);

    return (
        <div className="h-[calc(100vh-64px)] p-6 bg-gray-50 flex flex-col">
            <div className="mb-6 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Pipeline Editor Playground</h1>
                    <p className="text-gray-500">Visual editor for RAG pipelines using interact-flow logic.</p>
                </div>
                <button
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
                    onClick={() => console.log('Saved Config:', config)}
                >
                    Save Configuration
                </button>
            </div>

            <div className="flex-1 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                <PipelineEditor
                    initialConfig={config}
                    onConfigChange={setConfig}
                />
            </div>
        </div>
    );
}
