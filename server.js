import express from 'express';
import cors from 'cors';
import bodyparser from 'body-parser';
import { Pool } from 'pg';

const app = express();
app.use(cors());
app.use(bodyparser.json());

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'postgres',
  password: 'postgres22',
  port: 5432,
  ssl: false  
});
//TASK 1
app.post('/api/nursing/patients', async (req, res) => {
  try {
    const { patientName, age, roomNumber, assignedNurse, careNotes } = req.body;
    const result = await pool.query(
      `INSERT INTO patients (patientName, age, roomNumber, assignedNurse, careNotes)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [patientName, age, roomNumber, assignedNurse, careNotes]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database insert failed' });
  }
});


app.get('/api/nursing/patients', async (req, res) => {
  try {
    const { search } = req.query;
    let result;
    if (search) {
      result = await pool.query(
        `SELECT * FROM patients WHERE LOWER(patientName) LIKE $1 ORDER BY id DESC`,
        [`%${search.toLowerCase()}%`]
      );
    } else {
      result = await pool.query(`SELECT * FROM patients ORDER BY id DESC`);
    }
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database read failed' });
  }
});


app.put('/api/nursing/patients/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const fields = [];
    const values = [];
    let i = 1;

    for (const key of ['roomNumber', 'careNotes']) {
      if (req.body[key] !== undefined) {
        fields.push(`${key} = $${i++}`);
        values.push(req.body[key]);
      }
    }
    if (fields.length === 0) return res.status(400).json({ error: 'No fields to update' });

    values.push(id);
    const query = `UPDATE patients SET ${fields.join(', ')} WHERE id = $${i} RETURNING *`;
    const result = await pool.query(query, values);

    if (result.rows.length === 0) return res.status(404).json({ error: 'Patient not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database update failed' });
  }
});


app.delete('/api/nursing/patients/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query(`DELETE FROM patients WHERE id = $1`, [id]);
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database delete failed' });
  }
});
//TASK 2
app.post('/api/nursing/schedules', async (req, res) => {
  const { patientId, therapyType, therapist, scheduledTime, status } = req.body;

  if (!patientId || !therapyType || !therapist || !scheduledTime) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO therapy_schedules (patientId, therapyType, therapist, scheduledTime, status)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [patientId, therapyType, therapist, scheduledTime, status || 'Pending']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('DB Error:', err);
    res.status(500).json({ error: 'Failed to create therapy schedule' });
  }
});


app.get('/api/nursing/schedules', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT ts.*, p.patientName
      FROM therapy_schedules ts
      JOIN patients p ON ts.patientId = p.id
      ORDER BY ts.scheduledTime ASC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch schedules' });
  }
});

app.patch('/api/nursing/schedules/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const result = await pool.query(
      `UPDATE therapy_schedules SET status = $1 WHERE id = $2 RETURNING *`,
      [status, id]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ error: 'Schedule not found' });

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update status' });
  }
});
// TASK 3
app.get('/api/nursing/shifts', (req, res) => {
  const shifts = [
    {
      nurseName: "Mareeswari",
      shift: "Morning",
      patients: ["Ravi Kumar", "Deepa Rajan"]
    },
    {
      nurseName: "Anjali Devi",
      shift: "Evening",
      patients: ["Suresh Menon"]
    },
    {
      nurseName: "Priya Raman",
      shift: "Night",
      patients: ["Ravi Kumar"]
    }
  ];
  res.json(shifts);
});
// TASK 4
app.post('/api/nursing/vitals', async (req, res) => {
  const { patientId, bloodPressure, temperature, pulse } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO vitals (patientId, bloodPressure, temperature, pulse)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [patientId, bloodPressure, temperature, pulse]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add vital record' });
  }
});

app.get('/api/nursing/vitals/:patientId', async (req, res) => {
  try {
    const { patientId } = req.params;
    const result = await pool.query(
      `SELECT * FROM vitals WHERE patientId = $1 ORDER BY timestamp DESC`,
      [patientId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch vitals' });
  }
});

app.listen(5000, () => console.log('Server running on port 5000 (PostgreSQL connected)'));