export const Method = ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE'] as const;
export type Method = typeof Method[number];

export type Path = `/${string}`;
