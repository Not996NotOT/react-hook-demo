import React, { useEffect } from "react";
import logo from "./logo.svg";
import "./App.css";
import { List } from "linqts";
import { useLocalStore, observer } from "mobx-react-lite";

interface ITodo {
  id: string | undefined;
  item: string;
  datetime: string;
  [key: string]: any;
}
class Todo implements ITodo {
  id: string | undefined;
  item: string;
  datetime: string;
  constructor(params?: {
    id?: string | undefined;
    item?: string;
    datetime?: string;
  }) {
    this.id = params?.id ?? Math.random().toString();
    this.item = params?.item ?? "";
    this.datetime = params?.datetime ?? "";
  }
}
let todoList: List<ITodo> = new List([
  {
    id: "1",
    item: "todo2",
    datetime: "2021-08-14",
  },
  {
    id: "2",
    item: "todo3",
    datetime: "2021-08-14",
  },
]);
class TodoService {
  getTodoList(): Promise<List<ITodo>> {
    return new Promise((resovle) => {
      setTimeout(() => {
        resovle(todoList);
      }, 1000);
    });
  }
  addTodo(todo: ITodo) {
    todoList.Add(todo);
  }
  updateTodo(todo: ITodo) {
    console.log(todo);
    let entity = todoList.Where((item) => item?.id == todo.id).FirstOrDefault();
    entity.item = todo.item;
    entity.datetime = todo.datetime;
    console.log(todoList);
  }
  removeTodo(todo: ITodo) {
    todoList = todoList.Where((item) => item?.id !== todo.id);
  }
}

const useTodoForm = () => {
  const state = useLocalStore<ITodo>(() => {
    return {
      id: "",
      item: "",
      datetime: "",
    };
  });
  const getTodoData = () => {
    console.log(state);
    return state;
  };
  const addTodo = (event: (todo: ITodo) => void) => {
    event({
      id: undefined,
      item: state.item,
      datetime: state.datetime,
    });
  };
  const updateTodo = (event: (todo: ITodo) => void) => {
    event({
      id: state.id,
      item: state.item,
      datetime: state.datetime,
    });
  };
  const loadTodo = (todo: ITodo) => {
    state.id = todo.id;
    state.item = todo.item;
    state.datetime = todo.datetime;
  };
  const clearTodo = () => {
    Object.getOwnPropertyNames(state).forEach((item) => {
      state[item] = "";
    });
  };
  const hasTodo = () => {
    return state.id !== "";
  };
  return {
    updateTodo,
    addTodo,
    loadTodo,
    hasTodo,
    clearTodo,
    getTodoData,
    template: observer(() => (
      <div style={{ display: "flex", alignItems: "center" }}>
        <div>item</div>
        <input
          value={state.item}
          onChange={(e) => {
            state.item = e.target.value;
          }}
        />
        <div>datetime</div>
        <input
          value={state.datetime}
          onChange={(e) => (state.datetime = e.target.value)}
        />
      </div>
    )),
  };
};

const App = observer(() => {
  const service = new TodoService();
  const todoForm = useTodoForm();
  const state = useLocalStore<{ todoList: ITodo[]; loading: boolean }>(() => {
    return { todoList: [], loading: false };
  });
  const getTodoList = async () => {
    state.loading = true;
    let data = await service.getTodoList();
    state.todoList = data.ToArray();
    state.loading = false;
  };
  useEffect(() => {
    getTodoList();
  }, []);
  return (
    <div>
      {state.loading ? (
        <>loading......</>
      ) : (
        state.todoList.length > 0 &&
        state.todoList.map((item) => {
          return (
            <div
              style={{
                border: "1px solid gray",
                cursor: "pointer",
                paddingTop: "10px",
                paddingBottom: "10px",
              }}
              key={item.item + Math.random()}
              onClick={() => todoForm.loadTodo(item)}
            >
              id:{item.id}
              item:{item.item}
              datetiem:{item.datetime}
              <button
                onClick={() => {
                  service.removeTodo(item);
                  getTodoList();
                }}
              >
                删除
              </button>
            </div>
          );
        })
      )}
      <todoForm.template />
      <button
        onClick={() => {
          todoForm.addTodo(async (todo) => {
            service.addTodo(new Todo(todo));
            getTodoList();
          });
        }}
      >
        添加
      </button>
      {todoForm.hasTodo() && (
        <>
          <button
            onClick={() => {
              todoForm.updateTodo(async (todo) => {
                service.updateTodo(todo);
                getTodoList();
              });
            }}
          >
            更新
          </button>
          <button
            onClick={() => {
              todoForm.clearTodo();
            }}
          >
            清空
          </button>
        </>
      )}
    </div>
  );
});

export default App;
