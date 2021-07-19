import React, { useState } from "react";
import { useLocation } from "wouter";
import { useHotkeys } from "react-hotkeys-hook";

import { useRete } from "../../../contexts/Rete";
import { useLayout } from "../../../contexts/Layout";

import css from "./menuBar.module.css";
import thothlogo from "./thoth.png";

const MenuBar = ({ tabs }) => {
  // eslint-disable-next-line no-unused-vars
  const [location, setLocation] = useLocation();

  const useToggle = (initialValue = false) => {
    const [value, setValue] = useState(initialValue);
    const toggle = React.useCallback(() => {
      setValue((v) => !v);
    }, []);
    return [value, toggle];
  };
  const [menuVisibility, togglemenuVisibility] = useToggle();

  //Menu bar functions
  const { serialize } = useRete();
  // const { saveCurrentSpell } = useSpell();
  const { componentTypes, createOrFocus } = useLayout();

  const onSave = () => {
    // const serialized = serialize();
    // saveCurrentSpell({ graph: serialized });
  };

  const onNew = () => {
    setLocation("/home/create-new");
  };
  const onOpen = () => {
    setLocation("/home");
  };

  const onSerialize = () => {
    const serialized = serialize();
    console.log(JSON.stringify(serialized));
  };

  const onStateManager = () => {
    createOrFocus(componentTypes.STATE_MANAGER, "State Manager");
  };

  const onPlaytest = () => {
    createOrFocus(componentTypes.PLAYTEST, "Playtest");
  };

  const onInspector = () => {
    createOrFocus(componentTypes.INSPECTOR, "Inspector");
  };

  const onTextEditor = () => {
    createOrFocus(componentTypes.TEXT_EDITOR, "Text Editor");
  };

  //Menu bar hotkeys
  useHotkeys(
    "cmd+s, crtl+s",
    (event) => {
      event.preventDefault();
      onSave();
    },
    { enableOnTags: "INPUT" },
    [onSave]
  );

  useHotkeys(
    "option+n, crtl+n",
    (event) => {
      console.log("NEW");
      event.preventDefault();
      onNew();
    },
    { enableOnTags: "INPUT" },
    [onNew]
  );

  //Menu bar entries
  const menuBarItems = {
    file: {
      items: {
        new_project: {
          onClick: onNew,
        },
        open_project: {
          onClick: onOpen,
        },
        save: {
          items: {
            save_project: {
              onClick: onSave,
            },
            save_project_as: {
              onClick: onSave,
            },
            export_JSON: {
              onClick: onSerialize,
            },
          }
        }
      },
    },
    edit: {
      items: {
        undo: {},
        redo: {},
        copy: {},
        paste: {},
      },
    },
    studio: {
      items: {
        tools: {
          items: {
            text_editor: {
              onClick: onTextEditor,
            },
            inspector: {
              onClick: onInspector,
            },
            state_manager: {
              onClick: onStateManager,
            },
            playtest: {
              onClick: onPlaytest,
            },
            enki: {
              items: {
                fewshots: {},
                serialization: {},
                preamble: {},
              },
            },
          },
        },
        change_layout: {
          items: {
            multishot_editing: {},
            enki_fewshot_editing: {},
            node_editing: {},
          },
        },
      },
    },
  };

  //Menu bar rendering
  const ListItem = ({ item, label, topLevel, onClick }) => {
    label = label.replace(/_/g, " ");
    let children = null;
    if (item.items && Object.keys(item.items)) {
      children = (
        <ul className={css["menu-panel"]}>
          {Object.keys(item.items).map((i, x) => {
            return (
              <ListItem
                item={item?.items[i]}
                label={Object.keys(item.items)[x]}
                topLevel={false}
                key={x}
                onClick={item?.items[i].onClick}
              />
            );
          })}
        </ul>
      );
    }

    return (
      <li
        className={`${css[topLevel ? "menu-bar-item" : "list-item"]}`}
        onClick={onClick}
      >
        {label}
        {children && <div className={css["folder-arrow"]}> ❯ </div>}
        {!topLevel && <br />}
        {children}
      </li>
    );
  };

  const handleClick = (func) => {
    //Initially intended to control the visibility with a state, but this triggers a re-render and hides the menu anyway! :D
    //Keeping this intact just in case.
    togglemenuVisibility(menuVisibility);
    // eslint-disable-next-line no-eval
    eval(func);
  };

  return (
    <ul className={css["menu-bar"]}>
      <img className={css["thoth-logo"]} alt="Thoth logo" src={thothlogo} />
      {Object.keys(menuBarItems).map((item, index) => (
        <ListItem
          item={menuBarItems[item]}
          label={Object.keys(menuBarItems)[index]}
          topLevel={true}
          key={index}
          onClick={() => {
            handleClick(menuBarItems[item].onClick);
          }}
        />
      ))}
    </ul>
  );
};

export default MenuBar;
