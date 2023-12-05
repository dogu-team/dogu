import { YamlManager } from '@dogu-private/console';
import { RoutineSchema } from '@dogu-private/types';
import { create } from 'zustand';

export interface RoutineEditorStore {
  yaml: string;
  schema: RoutineSchema;
  updateYaml: (yaml: string) => void;
  updateSchema: (schema: RoutineSchema) => void;
}

const useRoutineEditorStore = create<RoutineEditorStore>((set) => ({
  yaml: '',
  schema: {
    name: '',
    on: {},
    jobs: {},
    repository: '',
  },
  updateYaml: (yaml) => {
    try {
      const schema = YamlManager.parseYaml<RoutineSchema>(yaml);
      set({ yaml, schema });
    } catch (e) {
      set({ yaml });
    }
  },
  updateSchema: (schema) => {
    try {
      const yaml = YamlManager.dumpToYaml<RoutineSchema>(schema, { lineWidth: -1 });
      set({ schema, yaml });
    } catch (e) {
      set({ schema });
    }
  },
}));

export default useRoutineEditorStore;
