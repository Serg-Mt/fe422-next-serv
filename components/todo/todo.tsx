import { MouseEventHandler, useState } from 'react';
import useSWR from 'swr';
import { ToDo } from '@prisma/client';
import classes from './todo.module.css';


const
  TOGGLE_CHECKBOX_ACTION = 'toggle-checkbox',
  DELETE_ACTION = 'del',
  ADD_ACTION = 'add',
  // DEL_COMPLETED_ACTION = 'del-completed',
  API_URL = '/api/todo',

  fetcher = async (url: string | URL): Promise<ToDo[]> => { //   fetcher(['api','posts','5']) /api/poasts/5
    const response = await fetch(url);
    if (!response.ok) throw new Error('fetch ' + response.status);
    const data = await response.json();
    // data.forEach(obj => obj.checked = !!obj.checked);
    console.log('data=', data);
    return data;
  };


export function ToDoList() {
  const
    [text, setText] = useState(''),
    { data, error, isLoading, isValidating, mutate } = useSWR(API_URL, fetcher),
    onClick: MouseEventHandler = async event => {
      const
        target = event.target as HTMLElement,
        action = (target.closest('[data-action]') as HTMLElement)?.dataset?.action,
        id = (target.closest('[data-id]') as HTMLElement)?.dataset?.id;
      console.log('onClick', { action, id });
      switch (action) {
        case DELETE_ACTION:
          await fetch(API_URL + '/' + id, { method: 'DELETE' });
          mutate();
          return;
        case ADD_ACTION:
          await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text, checked: false })
          });
          mutate();
          return;
        case TOGGLE_CHECKBOX_ACTION:
          const
            current: ToDo | undefined = data?.find(el => String(id) === String(el.id)),
            checked = !current?.checked;
          await fetch(API_URL + '/' + id, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ checked })
          });
          mutate();
          return;
      };
    };
  console.log('swr=', { data, error });
  return <fieldset onClick={onClick} className={classes.todoApp}>
    <div className={classes.example}>
      {isLoading && '⌛'}
      {isValidating && '👁'}
      {error && `💀 ${error.toString()}`}
    </div>

    <input value={text} onInput={event => setText(event.currentTarget.value)} />
    <button data-action={ADD_ACTION}>add</button>
    <ol>
      {data?.map(item => <Item key={item.id} item={item} />)}
    </ol>
  </fieldset>;
}

function Item({ item }: { item: ToDo }) {
  const
    { id, checked, text } = item;
  return <li data-id={id}>
    <input type="checkbox" checked={checked} data-action={TOGGLE_CHECKBOX_ACTION} />
    <span>{text}</span>
    <button data-action={DELETE_ACTION}>❌</button>
    {!!checked && '💹'}
    {/* {typeof checked} */}
  </li>
}