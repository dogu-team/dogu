export type FilterValueUpdator<I> = (updator: {
  [key in keyof I]?: (value: I[key]) => I[key];
}) => void;

export interface FilterStore<I> {
  filterValue: I;
  updateFilter: FilterValueUpdator<I>;
  resetFilter: () => void;
}

export const filterUpdatorFunc = <I, S>(
  updator: Parameters<FilterValueUpdator<I>>[0],
  setter: Function,
  getter: () => S,
) => {
  const state = getter();
  Object.keys(updator).map((item) => {
    const key = item as keyof Omit<S, 'updateFilter'>;
    setter((prev: FilterStore<I>) => ({
      // @ts-ignore
      filterValue: { ...prev.filterValue, [key]: updator[key](state.filterValue[key]) },
    }));
  });
};
