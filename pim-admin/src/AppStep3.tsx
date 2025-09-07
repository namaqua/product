// Step 3: Test @ alias imports
import Button from '@/components/common/Button';
import { classNames } from '@/utils/classNames';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            ✅ Step 3: Testing @ Alias Imports
          </h1>
          <p className="text-gray-600 mb-4">Testing @/ import paths...</p>

          <div className="flex gap-4">
            <Button variant="primary">@ Imports Work!</Button>
            <button className={classNames('px-4 py-2 rounded', 'bg-green-500 text-white')}>
              ClassNames Util Works!
            </button>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm font-semibold text-green-800">
            If you see styled buttons, @ alias imports work!
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
