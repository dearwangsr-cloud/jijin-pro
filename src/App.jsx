import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';

const COLORS = ['#2563eb', '#16a34a', '#f59e0b', '#dc2626', '#7c3aed', '#0891b2'];

const cardStyle = 'bg-white rounded-3xl shadow p-4';
const btnStyle = 'px-3 py-2 rounded-xl bg-blue-600 text-white text-sm';
const btnAltStyle = 'px-3 py-2 rounded-xl bg-slate-200 text-sm';
const inputStyle = 'w-full border rounded-xl px-3 py-2';

function monthlyFund(fund) {
  const amount = Number(fund?.amount || 0);
  if (fund?.cycle === '日') return amount * 22;
  if (fund?.cycle === '周') return amount * 4;
  return amount;
}

function monthlyType(type) {
  return (type?.funds || []).reduce((sum, fund) => sum + monthlyFund(fund), 0);
}

function loadData() {
  try {
    const raw = localStorage.getItem('fundManagerData');
    const parsed = JSON.parse(raw || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
}

function App() {
  const [data, setData] = useState(loadData());
  const [showModal, setShowModal] = useState(false);
  const [typeName, setTypeName] = useState('');
  const [showFundModal, setShowFundModal] = useState(false);
  const [activeTypeId, setActiveTypeId] = useState(null);
  const [fundName, setFundName] = useState('');
  const [fundAmount, setFundAmount] = useState('500');
  const [fundCycle, setFundCycle] = useState('月');

  useEffect(() => {
    localStorage.setItem('fundManagerData', JSON.stringify(data));
  }, [data]);

  const total = useMemo(() => data.reduce((s, t) => s + monthlyType(t), 0), [data]);
  const count = useMemo(() => data.reduce((s, t) => s + (t.funds || []).length, 0), [data]);

  const pieData = useMemo(() => {
    return data
      .map((t, i) => ({ name: t.name || '未命名', value: monthlyType(t), color: COLORS[i % COLORS.length] }))
      .filter((x) => x.value > 0);
  }, [data]);

  const barData = useMemo(() => {
    return data.map((t) => ({ name: (t.name || '未命名').slice(0, 4), value: monthlyType(t) }));
  }, [data]);

  function addType() {
    const name = typeName.trim();
    if (!name) return;
    setData([...data, { id: Date.now(), name, funds: [] }]);
    setTypeName('');
    setShowModal(false);
  }

  function addFund(typeId) {
    setActiveTypeId(typeId);
    setFundName('');
    setFundAmount('500');
    setFundCycle('月');
    setShowFundModal(true);
  }

  function saveFund() {
    if (!fundName.trim() || !activeTypeId) return;
    setData(data.map((t) => t.id === activeTypeId ? { ...t, funds: [...(t.funds || []), { id: Date.now(), name: fundName.trim(), amount: fundAmount, cycle: fundCycle, code: '' }] } : t));
    setShowFundModal(false);
  }

  function deleteType(id) {
    setData(data.filter((t) => t.id !== id));
  }

  function sortTypes() {
    setData([...data].sort((a, b) => monthlyType(b) - monthlyType(a)));
  }

  return (
    <div className="max-w-4xl mx-auto p-3 space-y-4 bg-slate-50 min-h-screen">
      <div className="rounded-3xl p-5 text-white shadow bg-gradient-to-r from-blue-600 to-cyan-500 flex justify-between items-center">
        <div>
          <div className="text-sm opacity-90">预计每月总定投</div>
          <div className="text-4xl font-bold">¥{total.toFixed(0)}</div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold">{count}</div>
          <div>{data.length} 类基金</div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className={cardStyle}>
          <div className="font-semibold mb-2">分类占比</div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={85}>
                  {pieData.map((item, i) => <Cell key={i} fill={item.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={cardStyle}>
          <div className="font-semibold mb-2">月定投柱状图</div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" radius={[8,8,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className={cardStyle + ' flex gap-2'}>
        <button className={btnStyle} onClick={() => setShowModal(true)}>新增类型</button>
        <button className={btnAltStyle} onClick={sortTypes}>排序</button>
      </div>

      <div className="space-y-3">
        {data.map((type) => (
          <div key={type.id} className={cardStyle}>
            <div className="flex items-center gap-2">
              <div className="font-bold text-lg flex-1">{type.name}</div>
              <div className="text-blue-600 font-semibold">¥{monthlyType(type).toFixed(0)}/月</div>
              <button className={btnStyle} onClick={() => addFund(type.id)}>+基金</button>
              <button className="px-3 py-2 rounded-xl bg-red-500 text-white text-sm" onClick={() => deleteType(type.id)}>删</button>
            </div>
            <div className="mt-3 space-y-2">
              {(type.funds || []).length === 0 ? <div className="text-sm text-slate-500">暂无基金</div> : null}
              {(type.funds || []).map((fund) => (
                <div key={fund.id} className="border rounded-2xl p-3 flex justify-between">
                  <div>
                    <div className="font-medium">{fund.name}</div>
                    <div className="text-xs text-slate-500">{fund.code}</div>
                  </div>
                  <div className="font-semibold">¥{fund.amount}/{fund.cycle}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {showFundModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-4 w-full max-w-md space-y-3">
            <div className="text-lg font-bold">新增基金</div>
            <input className={inputStyle} value={fundName} onChange={(e) => setFundName(e.target.value)} placeholder="基金名" />
            <input className={inputStyle} value={fundAmount} onChange={(e) => setFundAmount(e.target.value)} placeholder="金额" />
            <select className={inputStyle} value={fundCycle} onChange={(e) => setFundCycle(e.target.value)}>
              <option>日</option><option>周</option><option>月</option>
            </select>
            <div className="flex gap-2">
              <button className={btnAltStyle + ' flex-1'} onClick={() => setShowFundModal(false)}>取消</button>
              <button className={btnStyle + ' flex-1'} onClick={saveFund}>保存</button>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-4 w-full max-w-md space-y-3">
            <div className="text-lg font-bold">新增基金类型</div>
            <input className={inputStyle} value={typeName} onChange={(e) => setTypeName(e.target.value)} placeholder="例如：指数基金" />
            <div className="flex gap-2">
              <button className={btnAltStyle + ' flex-1'} onClick={() => setShowModal(false)}>取消</button>
              <button className={btnStyle + ' flex-1'} onClick={addType}>保存</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;

// Auto mount for Canvas preview
const rootEl = document.getElementById('root');
if (rootEl) {
  createRoot(rootEl).render(<App />);
}
