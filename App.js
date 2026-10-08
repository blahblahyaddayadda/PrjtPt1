import React, {useMemo, useState } from 'react';
import './App.css';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const today = () => new Date().toISOString().slice(0, 10);
const money = n => `$${Number(n || 0).toFixed(2)}`;
const uid = prefix => `${prefix}${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 90 + 10)}`;

const starter = {
  instructors: [
    { id: 'I00123', firstName: 'Stan', lastName: 'Lee', phone: '412-555-0112', email: 's_lee@example.com', address: 'Pittsburgh, PA', preferred: 'Email' },
    { id: 'I00124', firstName: 'Bruce', lastName: 'Banner', phone: '412-555-0160', email: 'bbruce@example.com', address: 'Pittsburgh, PA', preferred: 'Phone' }
  ],
  customers: [
    { id: 'C00123', firstName: 'Alex', lastName: 'Jones', phone: '412-555-0142', email: 'alex@example.com', address: 'Pittsburgh, PA', preferred: 'Email', balance: 4 },
    { id: 'C00124', firstName: 'Robert', lastName: 'Rivera', phone: '412-555-0188', email: 'robby@example.com', address: 'Pittsburgh, PA', preferred: 'Phone', balance: 10 }
  ],
  packages: [
    { id: 'P001', name: 'Single Class', category: 'General', count: '1', classType: 'General', duration: 1, price: 20 },
    { id: 'P002', name: '4 Class Pass', category: 'General', count: '4', classType: 'General', duration: 30, price: 70 },
    { id: 'P003', name: '10 Class Pass', category: 'General', count: '10', classType: 'General', duration: 90, price: 140 },
    { id: 'P004', name: '3 Months Unlimited', category: 'General', count: 'Unlimited', classType: 'General', duration: 90, price: 400 },
    { id: 'P005', name: 'Senior 4 Class Pass', category: 'Senior', count: '4', classType: 'General', duration: 30, price: 60 }
  ],
  classes: [
    { id: 'CL001', name: 'All Levels', instructorId: 'I00123', day: 'Monday', time: '18:15', classType: 'General', payRate: 45, published: true },
    { id: 'CL002', name: 'All Levels', instructorId: 'I00124', day: 'Tuesday', time: '09:00', classType: 'General', payRate: 45, published: true }
  ],
  sales: [], attendance: []
};

const nav = ['Dashboard', 'Instructors', 'Customers', 'Classes', 'Packages'];

function Field({ label, children }) { return <label><span>{label}</span>{children}</label>; }
function Empty({ text = 'No records yet.' }) { return <div className="empty">{text}</div>; }
function Badge({ children, tone = '' }) { return <span className={`badge ${tone}`}>{children}</span>; }
function Table({ heads, children }) {
  return <div className="table-wrap"><table><thead><tr>{heads.map(h => <th key={h}>{h}</th>)}</tr></thead><tbody>{children}</tbody></table></div>;
}

function People({ title, type, rows, setRows }) {
  const blank = { firstName: '', lastName: '', address: '', phone: '', email: '', preferred: 'Email' };
  const [form, setForm] = useState(blank);
  const [message, setMessage] = useState('');
  const update = e => setForm({ ...form, [e.target.name]: e.target.value });
  const submit = e => {
    e.preventDefault();
    if (!form.firstName.trim() || !form.lastName.trim() || !form.phone.trim() || !form.email.trim()) return setMessage('Please complete all required fields.');
    const duplicate = rows.some(r => `${r.firstName} ${r.lastName}`.toLowerCase() === `${form.firstName} ${form.lastName}`.toLowerCase());
    if (duplicate && !window.confirm('A person with this name already exists. Add another record?')) return;
    const id = uid(type === 'instructor' ? 'I' : 'C');
    setRows([...rows, { ...form, id, ...(type === 'customer' ? { balance: 0 } : {}) }]);
    setForm(blank); setMessage(`${title.slice(0, -1)} saved. Welcome message created for ${id}.`);
  };
  const remove = id => window.confirm('Delete this record?') && setRows(rows.filter(r => r.id !== id));
  return <section>
    <div className="page-title"><div><p className="eyebrow">People</p><h2>{title}</h2></div></div>
    <div className="split">
      <form className="card form" onSubmit={submit}>
        <h3>Add {title.slice(0, -1)}</h3>
        <div className="form-grid">
          <Field label="First name *"><input name="firstName" value={form.firstName} onChange={update} /></Field>
          <Field label="Last name *"><input name="lastName" value={form.lastName} onChange={update} /></Field>
          <Field label="Phone *"><input name="phone" value={form.phone} onChange={update} /></Field>
          <Field label="Email *"><input type="email" name="email" value={form.email} onChange={update} /></Field>
          <Field label="Address"><input name="address" value={form.address} onChange={update} /></Field>
          <Field label="Preferred communication"><select name="preferred" value={form.preferred} onChange={update}><option>Email</option><option>Phone</option></select></Field>
        </div>
        {message && <p className="notice">{message}</p>}
        <button className="primary">Save {title.slice(0, -1)}</button>
      </form>
      <div className="card"><h3>{title} List</h3>
        <Table heads={['ID', 'Name', 'Contact', ...(type === 'customer' ? ['Balance'] : []), '']}>
          {rows.map(r => <tr key={r.id}><td><strong>{r.id}</strong></td><td>{r.firstName} {r.lastName}</td><td>{r.email}<small>{r.phone}</small></td>{type === 'customer' && <td><Badge tone={r.balance < 0 ? 'danger' : ''}>{r.balance}</Badge></td>}<td><button className="link danger-text" onClick={() => remove(r.id)}>Delete</button></td></tr>)}
        </Table>
      </div>
    </div>
  </section>;
}

function Packages({ data, setData }) {
  const blank = { name: '', category: 'General', count: '4', classType: 'General', duration: 30, price: '' };
  const [form, setForm] = useState(blank);
  const change = e => setForm({ ...form, [e.target.name]: e.target.value });
  const submit = e => { e.preventDefault(); if (!form.name || !form.price) return; setData([...data, { ...form, id: uid('P'), duration: Number(form.duration), price: Number(form.price) }]); setForm(blank); };
  return <section><div className="page-title"><div><p className="eyebrow">Products</p><h2>Packages</h2></div></div><div className="split">
    <form className="card form" onSubmit={submit}><h3>Add Package</h3><div className="form-grid">
      <Field label="Package name *"><input name="name" value={form.name} onChange={change} /></Field>
      <Field label="Category"><select name="category" value={form.category} onChange={change}><option>General</option><option>Senior</option></select></Field>
      <Field label="Number of classes"><select name="count" value={form.count} onChange={change}><option>1</option><option>4</option><option>10</option><option>Unlimited</option></select></Field>
      <Field label="Class type"><select name="classType" value={form.classType} onChange={change}><option>General</option><option>Special</option></select></Field>
      <Field label="Validity (days)"><input type="number" name="duration" value={form.duration} onChange={change} /></Field>
      <Field label="Price *"><input type="number" name="price" value={form.price} onChange={change} /></Field>
    </div><button className="primary">Save Package</button></form>
    <div className="card"><h3>Available Packages</h3><Table heads={['ID', 'Package', 'Rules', 'Price']}>
      {data.map(p => <tr key={p.id}><td>{p.id}</td><td><strong>{p.name}</strong><small>{p.category}</small></td><td>{p.count} classes · {p.duration} days<small>{p.classType}</small></td><td>{money(p.price)}</td></tr>)}
    </Table></div></div></section>;
}

function Classes({ data, setData, instructors }) {
  const blank = { name: 'All Levels', instructorId: instructors[0]?.id || '', day: 'Monday', time: '09:00', classType: 'General', payRate: 45, published: false };
  const [form, setForm] = useState(blank); const [error, setError] = useState('');
  const change = e => setForm({ ...form, [e.target.name]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });
  const submit = e => { e.preventDefault(); if (!form.instructorId) return setError('Add an instructor first.'); const conflict = data.some(c => c.day === form.day && c.time === form.time); if (conflict) return setError('Schedule conflict: another class is already held at this time.'); setData([...data, { ...form, id: uid('CL'), payRate: Number(form.payRate) }]); setError(''); };
  const publish = id => setData(data.map(c => c.id === id ? { ...c, published: true } : c));
  const person = id => instructors.find(i => i.id === id);
  return <section><div className="page-title"><div><p className="eyebrow">Programming</p><h2>Classes</h2></div></div><div className="split">
    <form className="card form" onSubmit={submit}><h3>Add Class</h3><div className="form-grid">
      <Field label="Class name"><input name="name" value={form.name} onChange={change} /></Field>
      <Field label="Instructor"><select name="instructorId" value={form.instructorId} onChange={change}><option value="">Select</option>{instructors.map(i => <option key={i.id} value={i.id}>{i.firstName} {i.lastName}</option>)}</select></Field>
      <Field label="Day"><select name="day" value={form.day} onChange={change}>{DAYS.map(d => <option key={d}>{d}</option>)}</select></Field>
      <Field label="Time"><input type="time" name="time" value={form.time} onChange={change} /></Field>
      <Field label="Class type"><select name="classType" value={form.classType} onChange={change}><option>General</option><option>Special</option></select></Field>
      <Field label="Instructor pay rate"><input type="number" name="payRate" value={form.payRate} onChange={change} /></Field>
    </div>{error && <p className="notice error">{error}</p>}<button className="primary">Add Class</button></form>
    <div className="card"><h3>Class List</h3><Table heads={['Class', 'Schedule', 'Instructor', 'Status']}>
      {data.map(c => { const i = person(c.instructorId); return <tr key={c.id}><td><strong>{c.name}</strong><small>{c.classType}</small></td><td>{c.day}<small>{c.time}</small></td><td>{i ? `${i.firstName} ${i.lastName}` : 'Unassigned'}</td><td>{c.published ? <Badge>Published</Badge> : <button className="link" onClick={() => publish(c.id)}>Publish</button>}</td></tr>; })}
    </Table></div></div></section>;
}

function Sales({ data, setData, customers, packages, sales, setSales }) {
  const [customerId, setCustomerId] = useState(customers[0]?.id || '');
  const [packageId, setPackageId] = useState(packages[0]?.id || ''); 
  const [message, setMessage] = useState('');
  const [payment, setPayment] = useState('Card');

  const pack = packages.find(p => p.id === packageId);

  const submit = e => {
    e.preventDefault();
    if (!customerId || !packageId) {
      return setMessage('Please select a customer and a package.');
    }
    const sale = {
      id: uid('S'),
      customerId,
      packageId,
      amount: Number(pack.price),
      payment,
      date: new Date().toISOString()
    };
    setSales([...sales, sale]);
    setCustomers(customers.map(c => c.id === customerId ? { ...c, balance: c.balance + (pack.count === 'Unlimited' ? 999 : Number(pack.count))} :c));
    setMessage('Sale recorded and customer balance updated.');
  };

  return (
    <section>
      <div className="page-title">
        <div>
          <p className="eyebrow">Transaction</p>
        </div>
      </div>

      <div className="split">
        <form className="card form" onSubmit={submit}>
          <h3>New Sale</h3>

          <Field label="Customer">
            <select value={customerId} onChange={e => setCustomerId(e.target.value)}>
              {customers.map(c => (
                <option key={c.id} value={c.id}>
                  {c.firstName} {c.lastName}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Package">
            <select value={packageId} onChange={e => setPackageId(e.target.value)}>
              {packages.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </Field>

          <div className="summary">
            <span>Amount due</span>
            <strong>{money(pack?.price)}</strong>
          </div>

          <Field label="Payment Method">
            <select value={payment} onChange={e => setPayment(e.target.value)}>
              <option value="Card">Card</option>
              <option value="Cash">Cash</option>
              <option value="Check">Check</option>
            </select>
          </Field>

          {message && <p className="notice">{message}</p>}
          <button className="primary">Record Sale</button>

        </form>
        <div className="card">
          <h3>Recent Sales</h3>

          {sales.length ? (
          <Table heads={['ID', 'Customer', 'Package', 'Amount', 'Paid', 'Date']}>
            {[...sales].reverse().map(s => {
              const customer = customers.find(x => x.id === s.customerId);
              const pack = packages.find(x => x.id === s.packageId);

              return (
                <tr key={s.id}>
                  <td>{c?.firstName} {c?.lastName}</td>
                  <td>{p?.name}</td>
                  <td>{money(s.amount)}<small>{s.payment}</small></td>
                  <td>{new Date(s.date).toLocaleDateString()}</td>
                </tr>
              );
            })}
          </Table>
          ) : (
            <Empty />
          )}
        </div>
      </div>
    </section>
  );
}

    function Dashboard({ db, setPage }) {
    const cards = [
        ['Customers', db.customers.length, 'Customers'],
        ['Instructors', db.instructors.length, 'Instructors'],
        ['Classes', db.classes.length, 'Classes'],
        ['Packages', db.packages.length, 'Packages']
    ];

    return <section>
        <div className="hero">
            <div>
                <p className="eyebrow">Studio overview</p>
                <h2>Welcome to YogiTrack</h2>
                <p>Manage Yoga H’om classes, people, and packages.</p>
            </div>
        </div>

        <div className="stats">
            {cards.map(([label, value, go]) =>
                <button
                    className="stat card"
                    key={label}
                    onClick={() => setPage(go)}
                >
                    <span>{label}</span>
                    <strong>{value}</strong>
                    <small>View details →</small>
                </button>
            )}
        </div>

    </section>;
}

export default function App() {
  const [page, setPage] = useState('Dashboard');
    const [db, setDb] = useState(() => structuredClone(starter));
  const set = key => value => setDb(old => ({ ...old, [key]: value }));
    const content = useMemo(() => ({
        Dashboard: <Dashboard db={db} setPage={setPage} />,
        Instructors: <People
            title="Instructors"
            type="instructor"
            rows={db.instructors}
            setRows={set('instructors')}
        />,
        Customers: <People
            title="Customers"
            type="customer"
            rows={db.customers}
            setRows={set('customers')}
        />,
        Classes: <Classes
            data={db.classes}
            setData={set('classes')}
            instructors={db.instructors}
        />,
        Packages: <Packages
            data={db.packages}
            setData={set('packages')}
        />
    }), [db]);
    return <div className="app">
        <aside>
            <div className="brand">
                <div className="mark">Y</div>
                <div>
                    <h1>YogiTrack</h1>
                    <small>Yoga H’om Studio</small>
                </div>
            </div>

            <nav>
                {nav.map(n =>
                    <button
                        key={n}
                        className={page === n ? 'active' : ''}
                        onClick={() => setPage(n)}
                    >
                        {n}
                    </button>
                )}
            </nav>
        </aside>

        <main>
            <header>
                <div>
                    <strong>{page}</strong>
                    <small>Manager workspace</small>
                </div>
                <div className="avatar">M</div>
            </header>

            <div className="content">
                {content[page]}
            </div>
        </main>
    </div>;
}
