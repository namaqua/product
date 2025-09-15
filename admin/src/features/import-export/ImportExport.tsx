import { useState } from 'react';
import { Tab } from '@headlessui/react';
import { 
  ArrowUpTrayIcon, 
  ArrowDownTrayIcon, 
  ClockIcon,
  DocumentDuplicateIcon 
} from '@heroicons/react/24/outline';
import ImportManager from './components/ImportManager';
import ExportManager from './components/ExportManager';
import JobHistory from './components/JobHistory';
import MappingTemplates from './components/MappingTemplates';

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default function ImportExport() {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const tabs = [
    { name: 'Import', icon: ArrowUpTrayIcon, component: ImportManager },
    { name: 'Export', icon: ArrowDownTrayIcon, component: ExportManager },
    { name: 'Job History', icon: ClockIcon, component: JobHistory },
    { name: 'Mapping Templates', icon: DocumentDuplicateIcon, component: MappingTemplates },
  ];

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold leading-6 text-gray-900">
            Import / Export
          </h1>
          <p className="mt-2 text-sm text-gray-700">
            Bulk import and export your product data, categories, attributes, and more.
          </p>
        </div>
      </div>

      <div className="mt-8">
        <Tab.Group selectedIndex={selectedIndex} onChange={setSelectedIndex}>
          <Tab.List className="flex space-x-1 rounded-xl bg-blue-900/20 p-1">
            {tabs.map((tab) => (
              <Tab
                key={tab.name}
                className={({ selected }) =>
                  classNames(
                    'w-full rounded-lg py-2.5 text-sm font-medium leading-5',
                    'ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2',
                    selected
                      ? 'bg-white text-blue-700 shadow'
                      : 'text-blue-800 hover:bg-white/[0.12] hover:text-blue-600'
                  )
                }
              >
                <div className="flex items-center justify-center space-x-2">
                  <tab.icon className="h-5 w-5" />
                  <span>{tab.name}</span>
                </div>
              </Tab>
            ))}
          </Tab.List>
          <Tab.Panels className="mt-6">
            {tabs.map((tab, idx) => (
              <Tab.Panel
                key={idx}
                className={classNames(
                  'rounded-xl bg-white p-6',
                  'ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2'
                )}
              >
                <tab.component />
              </Tab.Panel>
            ))}
          </Tab.Panels>
        </Tab.Group>
      </div>
    </div>
  );
}
