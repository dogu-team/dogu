import { RepositoryFileTree } from '@dogu-private/console';
import Dexie, { Table } from 'dexie';

interface ProjectRepositoryDBSchema {
  path: string;
  data: string;
}

export class ProjectRepositoryDB extends Dexie {
  private scripts!: Table<ProjectRepositoryDBSchema, number>;

  constructor(projectId: string) {
    super(projectId);

    this.version(1).stores({
      scripts: '++path, data',
    });
  }

  async sync(repositoryFileTree: RepositoryFileTree) {
    const rows: ProjectRepositoryDBSchema[] = [];

    for (const node of repositoryFileTree) {
      if (node.type === 'blob') {
        const row: ProjectRepositoryDBSchema = {
          path: node.path,
          data: node.data,
        };

        rows.push(row);
      }
    }

    await this.scripts.bulkPut(rows);
  }

  async get(path: string): Promise<string> {
    const row = await this.scripts.get({ path });

    if (row) {
      return row.data;
    }

    return '';
  }

  deleteList(todoListId: number) {
    return this.transaction('rw', this.scripts, () => {
      this.scripts.delete(todoListId);
    });
  }
}
