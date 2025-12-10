import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Plus, RefreshCw, Search, XCircle } from 'lucide-react';
import subjectService from '../../../services/subjectService';
import tradeService from '../../../services/tradeService';

const initialFormData = {
  sbj_name: '',
  sbj_code: '',
};

export default function SubjectCreatePage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState(initialFormData);
  const [formError, setFormError] = useState('');
  const [operationLoading, setOperationLoading] = useState(false);

  const [trades, setTrades] = useState([]);
  const [tradeSearch, setTradeSearch] = useState('');
  const [selectedTradeIds, setSelectedTradeIds] = useState([]);
  const [loadingTrades, setLoadingTrades] = useState(false);

  const fetchTrades = async () => {
    try {
      setLoadingTrades(true);
      const res = await tradeService.getAllTrades();
      const data = res.data || res;
      setTrades(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch trades:', err);
    } finally {
      setLoadingTrades(false);
    }
  };

  useEffect(() => {
    fetchTrades();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.sbj_name.trim() || !formData.sbj_code.trim()) {
      setFormError('Subject name and subject code are required');
      return;
    }

    const payload = {
      sbj_name: formData.sbj_name,
      sbj_code: formData.sbj_code,
      trade_ids: selectedTradeIds,
    };

    try {
      setOperationLoading(true);
      await subjectService.createSubject(payload);
      navigate('/employee/dashboard/subjects');
    } catch (err) {
      const msg = err.message || 'Failed to create subject';
      setFormError(msg);
    } finally {
      setOperationLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-6 px-4">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate('/employee/dashboard/subjects')}
          className="inline-flex items-center text-sm text-slate-600 hover:text-slate-900 mb-4"
        >
          <span className="mr-1">⟵</span>
          Back to Subjects
        </button>

        <div className="bg-white rounded-xl shadow-lg border border-gray-100">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h1 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-600" />
              Add New Subject
            </h1>
            <button
              type="button"
              onClick={fetchTrades}
              className="p-2 border border-gray-300 rounded-full text-gray-600 hover:bg-gray-100 transition"
              disabled={loadingTrades}
            >
              <RefreshCw className={`w-4 h-4 ${loadingTrades ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="px-6 py-5">
            <form onSubmit={handleSubmit} className="space-y-4">
              {formError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-md text-sm flex items-center gap-2 mb-2">
                  <XCircle className="w-4 h-4" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Subject Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="sbj_name"
                    value={formData.sbj_name}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Subject Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="sbj_code"
                    value={formData.sbj_code}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Trades (optional, multi-select)</label>
                <p className="text-xs text-gray-500 mb-2">Search and select one or more trades that can learn this subject.</p>

                <div className="border border-gray-300 rounded-md p-3 space-y-2">
                  <div className="flex items-center gap-2 mb-2">
                    <Search className="w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={tradeSearch}
                      onChange={(e) => setTradeSearch(e.target.value)}
                      placeholder="Search trades by name..."
                      className="flex-1 border border-gray-200 rounded-md px-2 py-1 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={() => setSelectedTradeIds(trades.map((t) => t.trade_id))}
                      className="text-xs px-2 py-1 rounded-md bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
                    >
                      Select all
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedTradeIds([])}
                      className="text-xs px-2 py-1 rounded-md bg-gray-50 text-gray-600 hover:bg-gray-100"
                    >
                      Clear
                    </button>
                  </div>

                  <div className="max-h-40 overflow-y-auto space-y-1">
                    {trades
                      .filter((t) =>
                        tradeSearch.trim()
                          ? (t.trade_name || '').toLowerCase().includes(tradeSearch.toLowerCase())
                          : true
                      )
                      .map((trade) => {
                        const checked = selectedTradeIds.includes(trade.trade_id);
                        return (
                          <label
                            key={trade.trade_id}
                            className={`flex items-center justify-between px-2 py-1 rounded-md text-sm cursor-pointer ${
                              checked ? 'bg-indigo-50 text-indigo-700' : 'hover:bg-gray-50'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                                checked={checked}
                                onChange={() => {
                                  setSelectedTradeIds((prev) =>
                                    checked
                                      ? prev.filter((id) => id !== trade.trade_id)
                                      : [...prev, trade.trade_id]
                                  );
                                }}
                              />
                              <span>{trade.trade_name}</span>
                            </div>
                          </label>
                        );
                      })}

                    {trades.length === 0 && !loadingTrades && (
                      <p className="text-xs text-gray-400">No trades loaded. Ensure trade data exists.</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => navigate('/employee/dashboard/subjects')}
                  className="px-4 py-2 text-sm font-medium rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200 transition"
                  disabled={operationLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex justify-center items-center px-4 py-2 text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={operationLoading}
                >
                  {operationLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-1" />
                      Add Subject
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
