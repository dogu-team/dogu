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
  },
  updateYaml: (yaml) => set({ yaml, schema: YamlManager.parseYaml<RoutineSchema>(yaml) }),
  updateSchema: (schema) => set({ schema, yaml: YamlManager.dumpToYaml<RoutineSchema>(schema, { lineWidth: -1 }) }),
}));

export default useRoutineEditorStore;
