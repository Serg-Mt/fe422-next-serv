import { useState } from 'react';
import useSWR from 'swr';


const
  TOGGLE_CHECKBOX_ACTION = 'toggle-checkbox',
  DELETE_ACTION = 'del',
  ADD_ACTION = 'add',
  DEL_COMPLETED_ACTION = 'del-completed',
  API_URL = '/api/todo',

  fetcher = async (url) => {
    const response = await fetch(url);
    if (!response.ok) throw new Error('fetch ' + response.status);
    const data = await response.json();
    // data.forEach(obj => obj.checked = !!obj.checked);
    return data;
  };


export function ToDo() {
  const
    [text, setText] = useState(''),
    { data, error, isLoading, isValidating, mutate } = useSWR(API_URL, fetcher),
    onClick = async event => {
      const
        action = event.target.closest('[data-action]')?.dataset?.action,
        id = event.target.closest('[data-id]')?.dataset?.id;
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
          await fetch(API_URL + '/' + id, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ checked: !data.find(el => String(id) === String(el.id)).checked })
          }
          );
          mutate();
      };
    };
  console.log('swr=', { data, error });
  return <fieldset onClick={onClick}>
    <div style={{ position: 'absolute', fontSize: 'xxx-large' }}>
      {isLoading && '⌛'}
      {isValidating && '👁'}
      {error && `💀 ${error.toString()}`}
    </div>

    <input value={text} onInput={event => setText(event.target.value)} />
    <button data-action={ADD_ACTION}>add</button>
    <ol>
      {data?.map(item => <Item key={item.id} item={item} />)}
    </ol>
  </fieldset>;
}

function Item({ item }) {
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