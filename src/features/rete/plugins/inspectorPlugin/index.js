import { Inspector } from "./Inspector";

function install(editor) {
  const { publish, subscribe, events } = editor.pubSub;

  editor.on("componentregister", (component) => {
    const builder = component.builder;

    // we are going to override the default builder with our own, and will invoke the original builder inside it.
    component.builder = (node) => {
      // This will unsubscribe us
      if (node.subscription) node.subscription();
      // Inspector class which will handle regsistering data controls, serializing, etc.
      node.inspector = new Inspector({ component, editor, node });

      node.subscription = subscribe(
        events.$NODE_SET(node.id),
        (event, data) => {
          node.inspector.handleData(data);
          editor.trigger("nodecreated");
          publish(events.INSPECTOR_SET, node.inspector.data());
        }
      );

      builder.call(component, node);
    };
  });

  // handle publishing and subscribing to inspector
  editor.on("nodeselect", (node) => {
    publish(events.TEXT_EDITOR_CLEAR);
    publish(events.INSPECTOR_SET, node.inspector.data());
  });
}

export { DataControl } from "./DataControl";

const defaultExport = {
  name: "inspector",
  install,
};

export default defaultExport;
