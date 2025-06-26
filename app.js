const { useState, useEffect } = React;

function ContactEdit({ contact, onSave, onCancel, onDelete }) {
  const [formData, setFormData] = useState({ ...contact });

  useEffect(() => {
    setFormData({ ...contact });
  }, [contact]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div>
      <h2>{formData.id ? 'Edit Contact' : 'Add Contact'}</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>
            Name:
            <input name="name" value={formData.name || ''} onChange={handleChange} />
          </label>
        </div>
        <div>
          <label>
            Surname:
            <input name="surname" value={formData.surname || ''} onChange={handleChange} />
          </label>
        </div>
        <div>
          <label>
            Phone:
            <input name="phone" value={formData.phone || ''} onChange={handleChange} />
          </label>
        </div>
        <div>
          <label>
            Email:
            <input name="email" value={formData.email || ''} onChange={handleChange} />
          </label>
        </div>
        <button type="submit">Save</button>
        <button type="button" onClick={onCancel}>Cancel</button>
        {formData.id && (
          <button type="button" onClick={() => onDelete(formData)}>
            Delete
          </button>
        )}
      </form>
    </div>
  );
}

function App() {
  const [contacts, setContacts] = useState([]);
  const [filter, setFilter] = useState('');
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    fetch('http://localhost:3000/api/contacts/')
      .then((res) => res.json())
      .then((data) => setContacts(data))
      .catch((err) => console.error('Failed to load contacts', err));
  }, []);

  const handleSave = (contact) => {
    const method = contact.id ? 'PUT' : 'POST';
    const url = 'http://localhost:3000/api/contacts/' + (contact.id || '');
    fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(contact),
    })
      .then((res) => res.json())
      .then((data) => {
        if (contact.id) {
          setContacts((cs) => cs.map((c) => (c.id === data.id ? data : c)));
        } else {
          setContacts((cs) => [...cs, data]);
        }
        setEditing(null);
      })
      .catch((err) => console.error('Save failed', err));
  };

  const handleDelete = (contact) => {
    if (!contact.id) return;
    fetch('http://localhost:3000/api/contacts/' + contact.id, { method: 'DELETE' })
      .then(() => {
        setContacts((cs) => cs.filter((c) => c.id !== contact.id));
        setEditing(null);
      })
      .catch((err) => console.error('Delete failed', err));
  };

  const filtered = contacts.filter((c) =>
    (c.name + ' ' + c.surname + ' ' + c.email + ' ' + c.phone)
      .toLowerCase()
      .includes(filter.toLowerCase())
  );

  if (editing) {
    return (
      <ContactEdit
        contact={editing}
        onSave={handleSave}
        onCancel={() => setEditing(null)}
        onDelete={handleDelete}
      />
    );
  }

  return (
    <div>
      <h1>Contacts</h1>
      <input
        placeholder="Filter contacts"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
      />
      <button onClick={() => setEditing({ name: '', surname: '', phone: '', email: '' })}>
        Add Contact
      </button>
      <ul>
        {filtered.map((c) => (
          <li key={c.id} onClick={() => setEditing(c)} style={{ cursor: 'pointer' }}>
            {c.name} {c.surname} - {c.email} - {c.phone}
          </li>
        ))}
      </ul>
    </div>
  );
}

ReactDOM.render(<App />, document.getElementById('root'));

