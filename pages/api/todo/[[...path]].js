

// import { sql } from "@vercel/postgres";

// const likes = 100;
// const { rows } = await sql`SELECT * FROM todo`;

import { neon } from '@neondatabase/serverless';
const sql = neon(process.env.POSTGRES_URL);


export default async function todo(request, response) {
  const { path } = request.query,
    id = path?.[0];

  console.log('****', { id });
  const rows = await sql`SELECT * FROM todo`;
  response.status(200).json(
    rows
  );
}