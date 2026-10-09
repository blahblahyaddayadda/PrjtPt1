import React, {useEffect, useMemo, useState } from 'react';
import './App.css';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const today = () => new Date().toISOString().slice(0, 10);
const money = n => `$${Number(n || 0).toFixed(2)}`;
const uid = prefix => `${prefix}${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 90 + 10)}`;

const starter = {
  instructors: [],
  customers: [],
  packages: [],
  classes: [],
  sales: [], 
  attendance: []
};

const nav = ['Dashboard', 'Instructors', 'Customers', 'Classes', 'Packages', 'Sales', 'Attendance', 'Schedule', 'Reports'];

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

function Sales({ customers, setCustomers, packages, sales, setSales }) {
  const [customerId, setCustomerId] = useState(customers[0]?.id || ''); const [packageId, setPackageId] = useState(packages[0]?.id || ''); const [payment, setPayment] = useState('Card'); const [message, setMessage] = useState('');
  const pack = packages.find(p => p.id === packageId);
  const submit = e => { e.preventDefault(); if (!customerId || !pack) return; const start = today(); const end = new Date(); end.setDate(end.getDate() + Number(pack.duration)); const sale = { id: uid('S'), customerId, packageId, amount: pack.price, payment, date: new Date().toISOString(), start, end: end.toISOString().slice(0, 10) }; setSales([...sales, sale]); if (pack.count !== 'Unlimited') setCustomers(customers.map(c => c.id === customerId ? { ...c, balance: Number(c.balance) + Number(pack.count) } : c)); setMessage(`Sale recorded. New balance: ${pack.count === 'Unlimited' ? 'Unlimited' : customers.find(c => c.id === customerId).balance + Number(pack.count)}.`); };
  return <section><div className="page-title"><div><p className="eyebrow">Transactions</p><h2>Record a Sale</h2></div></div><div className="split">
    <form className="card form" onSubmit={submit}><h3>New Package Sale</h3><Field label="Customer"><select value={customerId} onChange={e => setCustomerId(e.target.value)}>{customers.map(c => <option key={c.id} value={c.id}>{c.firstName} {c.lastName} ({c.id})</option>)}</select></Field><Field label="Package"><select value={packageId} onChange={e => setPackageId(e.target.value)}>{packages.map(p => <option key={p.id} value={p.id}>{p.name} — {money(p.price)}</option>)}</select></Field><div className="summary"><span>Amount due</span><strong>{money(pack?.price)}</strong></div><Field label="Payment method"><select value={payment} onChange={e => setPayment(e.target.value)}><option>Card</option><option>Cash</option><option>Check</option></select></Field>{message && <p className="notice">{message}</p>}<button className="primary">Record Sale</button></form>
    <div className="card"><h3>Recent Sales</h3>{sales.length ? <Table heads={['Customer', 'Package', 'Paid', 'Date']}>{[...sales].reverse().map(s => { const c = customers.find(x => x.id === s.customerId), p = packages.find(x => x.id === s.packageId); return <tr key={s.id}><td>{c?.firstName} {c?.lastName}</td><td>{p?.name}</td><td>{money(s.amount)}<small>{s.payment}</small></td><td>{new Date(s.date).toLocaleDateString()}</td></tr>; })}</Table> : <Empty />}</div>
  </div></section>;
}

function Attendance({ classes, instructors, customers, setCustomers, attendance, setAttendance }) {
  const [classId, setClassId] = useState(classes[0]?.id || ''); 
  const [date, setDate] = useState(today()); 
  const [selected, setSelected] = useState([]); 
  const [message, setMessage] = useState('');
  const cls = classes.find(c => c.id === classId); 
  const toggle = id => setSelected(selected.includes(id) ? selected.filter(x => x !== id) : [...selected, id]);
  const save = () => { 
    if (!cls || !selected.length) return setMessage('Choose a class and at least one customer.'); 
  const low = customers.filter(c => selected.includes(c.id) && c.balance <= 0); 
  if (low.length && !window.confirm(`${low.length} customer(s) have no balance. Continue with a negative balance?`)) return; 
  const entries = selected.map(customerId => ({ id: uid('A'), classId, customerId, date })); 
  setAttendance([...attendance, ...entries]); 
  setCustomers(customers.map(c => selected.includes(c.id) ? { ...c, balance: Number(c.balance) - 1 } : c)); 
  setMessage(`${selected.length} customer(s) checked in. Confirmations created.`); 
  setSelected([]); 
};
  const scheduledDay = cls ? DAYS[new Date(`${date}T12:00:00`).getDay()] : ''; 
  const mismatch = cls && scheduledDay !== cls.day;
  return <section><div className="page-title"><div><p className="eyebrow">Check-in</p><h2>Class Attendance</h2></div></div><div className="split">
    <div className="card form">
      <h3>Attendance Form</h3>
      <Field label="Class"><select value={classId} onChange={e => setClassId(e.target.value)}>{classes.map(c => <option key={c.id} value={c.id}>{c.day} {c.time} · {c.name}</option>)}</select>
      </Field>
      <Field label="Attendance date"><input type="date" value={date} onChange={e => setDate(e.target.value)} />
      </Field>
      {mismatch && <p className="notice warning">Warning: this date is {scheduledDay}, but the class is scheduled for {cls.day}.</p>}
      <h4>Select customers</h4>
      <div className="check-list">{customers.map(c => <label key={c.id}><input type="checkbox" checked={selected.includes(c.id)} onChange={() => toggle(c.id)} /><span>{c.firstName} {c.lastName}<small>{c.id} · Balance {c.balance}</small></span></label>)}
      </div>
      {message && <p className="notice">{message}</p>}
      <button className="primary" onClick={save}>Save Attendance</button>
      </div>
    <div className="card"><h3>Recent Check-ins</h3>{attendance.length ? <Table heads={['Date', 'Class', 'Customer']}>{[...attendance].reverse().slice(0, 20).map(a => { const c = customers.find(x => x.id === a.customerId), cl = classes.find(x => x.id === a.classId); 
      return <tr key={a.id}><td>{a.date}</td>
      <td>{cl?.name}</td>
      <td>{c?.firstName} {c?.lastName}</td></tr>; })}
      </Table> : <Empty />}
      </div>
  </div>
  </section>;
}

function Schedule({ classes, instructors }) {
  const rows = [...classes].filter(c => c.published).sort((a, b) => DAYS.indexOf(a.day) - DAYS.indexOf(b.day) || a.time.localeCompare(b.time));
  return <section>
    <div className="page-title">
      <div>
      <p className="eyebrow">Published</p>
      <h2>Weekly Schedule</h2>
      </div>
    </div>
      <div className="schedule-grid">{DAYS.map(day => <div className="day card" key={day}>
        <h3>{day}</h3>
        {rows.filter(c => c.day === day).map(c => { const i = instructors.find(x => x.id === c.instructorId); 
  return <div className="class-tile" key={c.id}><strong>{c.time}</strong><span>{c.name}</span><small>{i?.firstName || 'TBA'} · {c.classType}</small></div>; })}{!rows.some(c => c.day === day) && <small>No classes</small>}</div>)}</div></section>;
}

function Reports({ sales, attendance, customers, packages, classes, instructors }) {
  const revenue = sales.reduce((n, s) => n + Number(s.amount), 0);
  return <section>
    <div className="page-title"><div>
      <p className="eyebrow">Insights</p>
      <h2>Studio Reports</h2>
      </div></div>
      <div className="report-grid">
    <div className="card"><h3>Package Sales</h3>
    <div className="big-number">{money(revenue)}</div>
    <p>{sales.length} packages sold</p>
    {packages.map(p => <div className="report-row" key={p.id}><span>{p.name}</span><strong>{sales.filter(s => s.packageId === p.id).length}</strong></div>)}
    </div>
    <div className="card">
      <h3>Instructor Performance</h3>
      {instructors.map(i => { const ids = classes.filter(c => c.instructorId === i.id).map(c => c.id); return <div className="report-row" key={i.id}><span>{i.firstName} {i.lastName}<small>{ids.length} assigned classes</small></span><strong>{attendance.filter(a => ids.includes(a.classId)).length} check-ins</strong></div>; 
    })}</div>
    <div className="card">
      <h3>Customer Attendance</h3>
      {customers.map(c => <div className="report-row" key={c.id}><span>{c.firstName} {c.lastName}<small>Balance {c.balance}</small></span><strong>{attendance.filter(a => a.customerId === c.id).length} visits</strong></div>)}
      </div>
    <div className="card">
      <h3>Teacher Payment Estimate</h3>
      {instructors.map(i => { const taught = classes.filter(c => c.instructorId === i.id); 
        const estimate = taught.reduce((n, c) => n + Number(c.payRate), 0); 
        return <div className="report-row" key={i.id}><span>{i.firstName} {i.lastName}<small>{taught.length} scheduled classes</small></span><strong>{money(estimate)}</strong></div>; 
        })}
        <p className="fine-print">Estimate uses one pay rate per scheduled class.</p>
        </div>
  </div>
  </section>;
}

function Dashboard({ db, setPage }) {
  const cards = [['Customers', db.customers.length, 'Customers'], ['Instructors', db.instructors.length, 'Instructors'], ['Published classes', db.classes.filter(c => c.published).length, 'Schedule'], ['Sales', money(db.sales.reduce((n, s) => n + Number(s.amount), 0)), 'Sales']];
  return <section>
    <div className="hero"><div>
      <p className="eyebrow">Studio overview</p>
      <h2>Welcome to YogiTrack</h2>
      <p>Manage Yoga H’om classes, people, packages, sales, and attendance.</p>
      </div>
      <button className="primary" onClick={() => setPage('Attendance')}>Record attendance</button>
      </div>
      <div className="stats">{cards.map(([label, value, go]) => 
        <button className="stat card" key={label} onClick={() => setPage(go)}><span>{label}</span><strong>{value}</strong><small>View details →</small></button>)}</div>
        <div className="card getting-started">
          <h3>Part 1 workflow</h3>
          <ol>
            <li>Add instructors and customers.</li>
            <li>Create packages and scheduled classes.</li>
            <li>Publish the weekly schedule.</li>
            <li>Record a package sale.</li>
            <li>Check customers into a class and review reports.</li>
            </ol>
              </div>
              </section>;
}

export default function App() {
  const [page, setPage] = useState('Dashboard');
  const [db, setDb] = useState(() => { try { return JSON.parse(localStorage.getItem('yogitrack-data')) || starter;

  } 
  catch {
    return starter;
  } 
});
  useEffect(() => localStorage.setItem('yogitrack-data', JSON.stringify(db)), [db]);
  const set = key => value => setDb(old => ({ ...old, [key]: value }));
  const content = useMemo(() => ({
    Dashboard: <Dashboard db={db} setPage={setPage} />,
    Instructors: <People title="Instructors" type="instructor" rows={db.instructors} setRows={set('instructors')} />,
    Customers: <People title="Customers" type="customer" rows={db.customers} setRows={set('customers')} />,
    Classes: <Classes data={db.classes} setData={set('classes')} instructors={db.instructors} />,
    Packages: <Packages data={db.packages} setData={set('packages')} />,
    Sales: <Sales customers={db.customers} setCustomers={set('customers')} packages={db.packages} sales={db.sales} setSales={set('sales')} />,
    Attendance: <Attendance classes={db.classes} instructors={db.instructors} customers={db.customers} setCustomers={set('customers')} attendance={db.attendance} setAttendance={set('attendance')} />,
    Schedule: <Schedule classes={db.classes} instructors={db.instructors} />,
    Reports: <Reports {...db} />
  }), [db]);
    return (
    <div className="app">
      <aside className="sidebar">
        <h1>YogiTrack</h1>

        <nav>
          {nav.map(item => (
            <button
              key={item}
              className={page === item ? 'active' : ''}
              onClick={() => setPage(item)}
            >
              {item}
            </button>
          ))}
        </nav>
      </aside>

      <main className="main">
        {content[page]}
      </main>
    </div>
  );
}