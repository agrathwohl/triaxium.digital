'use client';

import { useState } from 'react';
import { Schematic } from '@/types';
import { Plus, Save, Download, Trash2 } from 'lucide-react';
import LLMAnalyzer from '@/components/LLMAnalyzer';

interface WorkspaceProps {
  userSchematics: Schematic[];
  onSaveSchematic: (schematic: Schematic) => void;
}

export default function Workspace({ userSchematics, onSaveSchematic }: WorkspaceProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedType, setSelectedType] = useState('tree');

  const handleSave = () => {
    const newSchematic: Schematic = {
      id: `user-${Date.now()}`,
      volume: 3,
      section: 'USER',
      page: 0,
      subject: 'NEW',
      title: title || 'Untitled Schematic',
      type: selectedType as any,
      description: description,
      terms: [],
      relationships: [],
    };
    onSaveSchematic(newSchematic);
    setTitle('');
    setDescription('');
  };

  return (
    <div className="flex-1 bg-gray-950 overflow-auto p-6">
      <div className="max-w-4xl mx-auto">
        {/* LLM Analysis Section */}
        <div className="mb-8">
          <LLMAnalyzer
            onSchematicGenerated={(schematic) => {
              onSaveSchematic(schematic as Schematic);
            }}
          />
        </div>

        <div className="border-t border-gray-800 my-8" />

        <div className="mb-6">
          <h2 className="text-xl font-semibold text-white mb-2">
            Manual Schematic Workspace
          </h2>
          <p className="text-gray-400 text-sm">
            Create new schematics using the Braxtonian formal language
          </p>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Creation Panel */}
          <div className="col-span-2 space-y-4">
            <div className="bg-gray-900 rounded-lg border border-gray-800 p-4">
              <h3 className="text-sm font-semibold text-white mb-3">
                New Schematic
              </h3>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter schematic title..."
                    className="w-full bg-gray-950 border border-gray-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-400 mb-1">
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe the schematic..."
                    rows={3}
                    className="w-full bg-gray-950 border border-gray-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-400 mb-1">
                    Type
                  </label>
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="w-full bg-gray-950 border border-gray-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="tree">Tree / Branching</option>
                    <option value="network">Network / Crossing</option>
                    <option value="horizontal">Horizontal Axis</option>
                    <option value="angled-tree">Angled Tree</option>
                  </select>
                </div>

                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Create Schematic
                </button>
              </div>
            </div>

            {/* Canvas Placeholder */}
            <div className="bg-gray-900 rounded-lg border border-gray-800 p-4 min-h-[300px]">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-white">
                  Canvas
                </h3>
                <div className="flex gap-2">
                  <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded">
                    <Save className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded">
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="flex items-center justify-center h-[200px] bg-gray-950 rounded border border-dashed border-gray-700">
                <p className="text-gray-500 text-sm">
                  Drag and drop terms here to build your schematic
                </p>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="bg-gray-900 rounded-lg border border-gray-800 p-4">
              <h3 className="text-sm font-semibold text-white mb-3">
                Term Palette
              </h3>
              <div className="space-y-2 max-h-[200px] overflow-y-auto">
                {['VT-DY', 'AFI', 'RT-ALGN', 'PROG-CONT', 'SPT-DYM', 'BIA', 'TR', 'C-CONT'].map((term) => (
                  <div
                    key={term}
                    className="flex items-center justify-between px-2 py-1 bg-gray-950 rounded text-sm text-gray-300 cursor-pointer hover:bg-gray-800"
                  >
                    <span>{term}</span>
                    <Plus className="w-3 h-3 text-gray-500" />
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-900 rounded-lg border border-gray-800 p-4">
              <h3 className="text-sm font-semibold text-white mb-3">
                Your Schematics
              </h3>
              <div className="space-y-2">
                {userSchematics.length === 0 ? (
                  <p className="text-gray-500 text-sm">
                    No schematics yet. Create one above.
                  </p>
                ) : (
                  userSchematics.map((schematic) => (
                    <div
                      key={schematic.id}
                      className="flex items-center justify-between px-2 py-2 bg-gray-950 rounded text-sm"
                    >
                      <span className="text-gray-300 truncate">
                        {schematic.title}
                      </span>
                      <button className="text-gray-500 hover:text-red-400">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
