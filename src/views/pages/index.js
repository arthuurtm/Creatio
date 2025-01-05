const modules = import.meta.glob('./*.vue', { eager: true });

const components = {};
for (const path in modules) {
  const name = path.replace('./', '').replace('.vue', '');
  components[name] = modules[path].default;
}

export default components;
