import type { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function todo(request: NextApiRequest, response: NextApiResponse) {
  const
    { query, method } = request,
    // { path } = query,
    id: number | undefined = Number(query?.path?.[0]);

  console.log('<<', method, { id }, request.body);
  switch (method) {
    case 'GET':
      const
        rows = await prisma.toDo.findMany({ orderBy: [{ id: 'asc' }] });
        console.log('data=',rows);
      response.status(200).json(rows);
      return;
    case 'DELETE':
      await prisma.toDo.delete({ where: { id } });
      response.status(200).json({});
      return;
    case 'POST':

      const
        text = request.body.text;
      await prisma.toDo.create({ data: { text } });
      response.status(201).json({});
      return;
    case 'PATCH':
      const
        checked = request.body.checked;
      await prisma.toDo.update({ where: { id }, data: { checked } });
      response.status(200).json({});
      return;
  }
}